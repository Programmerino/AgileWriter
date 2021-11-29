# Agile Writer
### CSCI-3308, Team 018-01, Fall 2021
###### Project Members
| Team Amazone         |                      |
| -------------------- | -------------------- |
| Nolan Ales           | Davis Davalos-DeLosh |
| James Boynton        | James Vogenthaler    |
| Aleksey Huhua        | Beff Jezos           |
###### Project Description
A “smart” processor with prompt generation, autocompletion, and more. Our application features a server-based user login and registration and file directory service as well as client side rich-text-editing and dynamic AI text generation. Users can create, rename, reorganize, and delete documents at their leisure. Our rich-text editor features dozens of styling options and up to 1GB of potential storage per document. Additionally, when stalled for thoughts or when at a loss for words, our word processor is linked to an open-sourced AI that will provide a suggestion to keep your thoughts moving. Our project also features a prompt generation page to get ideas started with the ability to save and load previously created prompts.

###### Project Features
- [x] Rich-text editing
- [x] Document stylization features (font family/size/color, alignment, etc)
- [x] Working file directory
- [x] File/folder manipulation (create, save, load, move, rename, & delete)
- [x] AI autocompletion on stalled input
- [x] AI prompt generation

###### File Organization
The source code for the application is found inside the *Agile Writer* folder. From there, the root folder contains docker and node.js data needed to build the project. `db`, `src`, and `heroku` contain the data relevant to the database, website, and heroku respectively

###### File Structure
```
|--db                     // Contains database data
    |--Dockerfile         // Pins PSQL version on heroku. Contains port number: 5352
    |--init_data          // Folder to contain initialization queries
        |--create.sql     // Macros to initialize database and fill with testing data
|--heroku                 // Contains heroku initialization data
    |--.env               // Heroku key (would'nt be shared if had access to $$$)
    |--Dockerfile         // Pins and installs heroku
|--src                    // Contains web application
    |--resources          // Contains resources
        |--css            // Contains stylesheets
        |--img            // Contains images
        |--js             // Contains client-side javascript
    |--views              // Contains client-side html
        |--pages          // Contains pages
        |--partials       // Contains shared elements (header, banner, menu, script loader)
    |--server.js          // Contains server-side javascript
    |--dbconfig.js        // Contains code to link server to psql
    |--passportConfig.js  // Contains code to save/authenticate user session data
    |--Nuget.Config       // Configuration for Nuget F#
    |--App.fs(proj)       // Used to build app with  F#
    |--CaretPos.fs        // Caret position coded in F#
    |--Quill.fs           // Autocompletion coded in F#
    |--quill-autocomplete // Output of F# js compilation
|--docker-composeyml      // Docker configuration manager
|--Dockerfile             // Docker build instructions
|--package.json           // Node.js build instructions
|--webpack.config.js      // Fable build instructions
```

###### Deployment
A live version of this web application can be found [here](https://csci3308-018.herokuapp.com/Login), hosted by courtesy of **Heroku**.