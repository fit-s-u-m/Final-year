# Final Year project

## Api
- root path
    - GET -> / 
    - input nothing
    - output `string`
    - "Hello from Abe"

- root path
    - POST -> / 
    - input voice
    - output
     - action -> name of the action like `call`,`appointment`, `alarm`, `turn on lights`
     - object -> argument that is going to be passed to the action like a name of person you want to call, or time of the alarm
     - other  -> other things it catchs that can't be categorized in the above
     - ```json
        {
            action:string,
            object:string,
            others:anything
        }
        ```
### You can call individual services

- 11 labs

    -  POST -> /speech2text
    - input voice
    - output is the text

    -  POST -> /text2speech
    - input text
    - output is the voice

- Gemini

    -  POST -> /changeText2Command
    - input text
    - output is the (command)
     - ```json
        {
            action:string,
            object:string,
            others:anything
        }
        ```

    -  POST -> /matchContact
    - input name, contacts(array of names)
     - ```json
        {
            name:string,
            contacts:string[],
        }
        ```
    - output is name from the contacts `string`

