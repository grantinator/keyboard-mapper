# keyboard-mapper

Here is a link to the website: http://keyboard-mapper.s3-website-us-east-1.amazonaws.com

This is a keyboard mapper that uses a bit of AWS. Here is how the website works,

1. Create a rule. This is a mapping from on character to another, say "a" -> "b". 
   Valid characters are a-z and 0-9 and mappings can only be for one character.
2. Type into the editor box on the right. With the above mapping "a" -> "b", as you type the
   the following sentence, "apples are really great" you will see the following appear in real time
   "bpples bre reblly grebt"
3. In the dropdown below the title there are two preset mappings for you to try which are provided through DynamoDb.

Enjoy!
