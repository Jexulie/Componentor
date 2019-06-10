const fs = require('fs');
const Meow = require('meow');
const Listr = require('listr');
const Execa = require('execa');
const Chalk = require('chalk');

/** METHOD
 * Get Component names from cli input
 * scan and verify files & folders (components, package.json, Component file)
 * create index.js file
 * change package.json
 * run bundler
 * propt to publish
 */

/**
 * TODO
 * promise functions for better errors
 */

const cli = Meow(`
    Warnings
        put all components in to components folder.

    Options
        --name, -n Change name of Package.
        --publish, -p Directly Publishes Package to NPM.
    `, {
    flags: {
        name: {
            type: 'string',
            alias: 'n'
        },
        publish: {
            type: 'boolean',
            alias: 'p'
        }
    },
    autoHelp: true,
    version: "1.0.0",
    booleanDefault: false
});

let inputPublish = cli.flags.publish;
let inputPkgName = cli.flags.name;
let inputComponents = cli.input;

tasks = [{
        title: 'Checking Files ...',
        task: () => {
            inputComponents.forEach(comp => this.checkFile(comp, true));
            this.checkFile('package.json');
        }
    },
    {
        title: 'Creating index.js ...',
        task: () => {
            this.createIndex(inputComponents);
        }
    },
    {
        title: 'Making Changes to package.json ...',
        task: () => {
            this.changePkg(inputPkgName)
        }
    },
    {
        title: 'Running Bundler ...',
        task: () => {
            Execa.stdout('npm', ['run', 'bundler']);
        }
    }
];

publishTasks = [
    {
        title: 'Log In to NPM ...',
        task: () => {
            Execa.stdout('npm', ['login']);
        }
    },
    {
        title: 'Publish to NPM ...',
        task: () => {
            Execa.stdout('npm', ['run', 'bundler']);
        }
    }
]

if(inputPublish){
    publishTasks.forEach(p => tasks.push(p))
}

const taskList = new Listr(tasks);


module.exports.checkFile = function (filename, isComponent) {
    // FUTURE inc src?
    let checker = isComponent ? 
        fs.existsSync('./' + filename) : 
        fs.existsSync('./src/component' + filename);
    if(!checker){
        throw new Error(`Could not find this file ${filename}`);
    }
}

module.exports.changePkg = function(pkgName) {
    let pkgPath = './package.json';
    let main = `./dist/${pkgName}.common.js`;
    let files = [
        "dist/*",
        "src/*",
        "public/*",
        "*.json",
        "*.js"
    ];
    let bundler = `vue-cli-service build --target lib --name ${pkgName} ./src/components/index.js`;

    // read json
    // let pkgjson = require(pkgPath);

    fs.readFile(pkgPath, (err, data) => {
        if(err) throw err;
        let pkgjson = JSON.parse(data);

        pkgjson.main = main;
        pkgjson.files = files;
        pkgjson.name = pkgName;
        pkgjson.scripts.bundler = bundler;

        // write json
        fs.writeFileSync(pkgPath, JSON.stringify(pkgjson));
    });

    
}

module.exports.createIndex = function(components) {
    let compNames = components.join(', ');

    let content = `import Vue from "vue";\n`;

    components.forEach(c => {
        content += `import ${c} from "./${c}.vue";\n`;
    });

    content += `const Components = {${compNames}};\n`;
    content += `Object.keys(Components).forEach(name => \n\t{Vue.component(name, Components[name]);\n});\nexport default Components;`;

    fs.writeFileSync('./components/index.js', content);
}

module.exports.startBundle = function () {
    Execa.stdout('npm', ['run', 'bundler']);
}

module.exports.start = function(){
    if(inputComponents.length > 0){
        taskList.run().catch(console.error);
    }else{
        console.log("No Inputs Given ...");
    }
}