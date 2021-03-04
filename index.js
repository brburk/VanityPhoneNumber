// Loads in the AWS SDK
const AWS = require('aws-sdk');

// Creates the document client specifying the region in us-east-1
const ddb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

//Loads English words included NPM layer
const englishwords = require('english-words');

// Function to get words from NPM Layer
const getWords = async () => {
    return await new Promise((resolve)=> {    
        let output = [];
        try{
            englishwords.getWords(words => resolve(words));
       } catch(error){
           console.log("error", error);
            resolve([]);
       }
        
    });
};

// Function to sort length descending with best fit results first
const sortData = async (filteredCombos) => {
    return await new Promise((resolve)=> {  
        filteredCombos = filteredCombos.sort(function(a, b){
        return b.length - a.length;
        });
        resolve(filteredCombos);
    });
};

// Function to check if caller already has results in DynamoDB
const validateAlreadyExist = async (phoneNumber) => {
	return await new Promise(async (resolve, reject) => {
		
		let record = await ddb.get({
			TableName : "VanityResult",
			Key: {GUID : phoneNumber}
		}).promise();
		
		return (Object.keys(record).length == 0)? resolve(null) : resolve(record.Item);
	});
};


exports.handler = async (event, context, callback) => {
    
    // Use Phone number from Connect
    const phone = event.Details.Parameters.custPhone;
    
    // Short circuit function if results already exist by Phone #
    let foundRecord = await validateAlreadyExist(phone);
    if(!!foundRecord){
        return foundRecord;
    }
    
    // Convert Phone# to array, keeping last 7 digits (excluding area code), & removing 0 - 1 as they have no reference letters
    let arrPhone = phone.toString().substr(phone.length - 7).replace(/[0-1]/g, '').split('').map(Number);
    
    // Get English wordBank from included NPM Layer function call
    let wordBank = await getWords();
    
    // Declaration for keypad, digit -to-> letter references
    const letters = {
        2: ['a', 'b', 'c'], 
        3: ['d', 'e', 'f'], 
        4: ['g', 'h', 'i'], 
        5: ['j', 'k', 'l'], 
        6: ['m', 'n', 'o'], 
        7: ['p', 'q', 'r', 's'], 
        8: ['t', 'u', 'v'],
        9: ['w', 'x', 'y', 'z']
    };
    
    // Generate letter combinations by digits of phone number
    function letterCombos(digits) 
    {
        if (!digits) return [];
        let combinations = [...letters[digits[0]]]; 
        for (let i = 1; i < digits.length; i++) 
        {
            const updatedCombos = [];
            combinations.forEach(combo => 
            { 
                letters[digits[i]].forEach(letter => 
                {
                    updatedCombos.push(combo + letter); 
                });
            });
            combinations = updatedCombos; 
        } 
        return combinations;
    }
    
    // Get letter combinations by digits function call
    let combos = letterCombos(arrPhone);
    
    // Filter english words included in available combinations
    let filteredCombos = wordBank.filter(item => {
        item = item.toLowerCase();
        for(let comboItem of combos){
            if(comboItem.includes(item)){
                return item;
            }
        }
    });
    
    // Determine best results, sorting by length descending function call
    filteredCombos = await sortData(filteredCombos);
    
    // Declare params object for storage in DynamoDB table
    const params = {
        TableName: 'VanityResult',
        Item: {
            'GUID' : phone,
            'result1' : filteredCombos[0],
            'result2' : filteredCombos[1],
            'result3' : filteredCombos[2],
            'result4' : filteredCombos[3],
            'result5' : filteredCombos[4],
            'message' : 'Success'
        }
    };
    
    // Try to write to DynamoDB |-| catch error
    try{
        await ddb.put(params).promise();
    }
    catch(error){
        console.log(error);
    }
};
