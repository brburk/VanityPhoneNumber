# VanityPhoneNumber
Vanity Phone Number

Functional Amazon Connect phone number to test:
(872) 766-4240

# 1. Record your reasons for implementing the solution the way you did, struggles you faced and problems you overcame.

The initial problems I faced were not being familiar with the Lambda environment & Dynamodb. These services are very powerful, this was a welcome challenge and opportunity to learn.
Assuming the phone number would be 7 digits. 
I had to process the phone number to exclude the area code, as well as 0 & 1. (as these are not bound to any corresponding letters)
I had to develop a means of mapping the digits to the letters in a format that would be functional for generating the letter combinations by digits.
Then I generated the combinations by the phone numbers digits.
To be able to find words from the resulting combinations I included a NPM/Layer in the Lambda function to resource a word bank.
Using the word bank, I was able to find the occurrences of English words within the combinations.
Sorting by descending length I assumed the best fit to be those that use the most digits/word length.
Then the top 5 results are written to the DynamoDB table.
Encountered an issue with Connect not awaiting the full length of the Lambda function I was able to overcome this by optimizing the execution time.
For added efficiency I added a function to check if the caller already had results in the database and short circuit the function if they had.


# 2. What shortcuts did you take that would be a bad practice in production?
I used the Phone number as the index of the table.
Granted all resources/functionality to the Lambda function for DynamoDB.

# 3. What would you have done with more time? We know you have a life. :-)
Given more time, I would have detailed better documentation, created the deployment package, and a web app to display the most recent 5 callers results.

# 4. BONUS - Please include an architecture diagram.
VanityArchitectureDiagram.png (included)
