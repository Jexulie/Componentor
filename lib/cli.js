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
            inputComponents.forEach(comp => {
                this.checkFile(comp + '.vue', true)
                    // .then(res => {
                    //     console.log(comp, res)
                    // })
                    .catch(err => {
                        if(err) throw err;
                    })
            });
            this.checkFile('package.json')
                // .then(res => {
                //     console.log(res)
                // })
                .catch(err => {
                    if(err) throw err;
                });
        }
    },
    {
        title: 'Creating index.js ...',
        task: () => {
            this.createIndex(inputComponents)
                // .then(res => {
                //     console.log("index ", res)
                // })
                .catch(err => {
                    if(err) throw err;
                })
        }
    },
    {
        title: 'Making Changes to package.json ...',
        task: () => {
            this.changePkg(inputPkgName)
                // .then(res => {
                //     console.log("package ", res)
                // })
                .catch(err => {
                    if(err) throw err;
                })
        }
    },
    {
        title: 'Running Bundler ...',
        task: () => {
            Execa.stdout('npm', ['run', 'bundler'])
            .then(_ => console.log("Componentor has finished bundling ..."));           
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



module.exports.checkFile = function (filename, isComponent) {
    return new Promise((resolve, reject) => {
        let mpath = isComponent ? './src/components/' : './';

        checker = fs.exists(mpath + filename, status => {
            if(!status){
                reject(new Error(`Could not find this file ${filename}`));
            }
            resolve(true);
        });    
    })
}

module.exports.changePkg = function(pkgName) {
    return new Promise((resolve, reject) => {
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

        fs.readFile(pkgPath, (err, data) => {
            if(err) throw err;
            let pkgjson = JSON.parse(data);

            pkgjson.main = main;
            pkgjson.files = files;
            pkgjson.name = pkgName;
            pkgjson.scripts.bundler = bundler;

            // write json
            fs.writeFile(pkgPath, JSON.stringify(pkgjson), err => {
                if(err) reject(err);
                resolve(true);
            });
    });
    })    
}

module.exports.createIndex = function(components) {
    return new Promise((resolve, reject) => {
        let compNames = components.join(', ');

        let content = `import Vue from "vue";\n`;

        components.forEach(c => {
            content += `import ${c} from "./${c}.vue";\n`;
        });

        content += `const Components = {${compNames}};\n`;
        content += `Object.keys(Components).forEach(name => \n\t{Vue.component(name, Components[name]);\n});\nexport default Components;`;

        fs.writeFile('./src/components/index.js', content, err => {
            if(err){
                reject(err);
            }
            resolve(true);
        });
    })
}

module.exports.startBundle = function () {
    Execa.stdout('npm', ['run', 'bundler']);
}

function start(){
    if(inputComponents.length > 0){
        if(inputPublish){
            publishTasks.forEach(p => tasks.push(p))
        }
    
        const taskList = new Listr(tasks);

        taskList.run().catch(console.error);
    }else{
        console.log("No Parameters Given Or Wrong Parameters ...");
        console.log("Try using --help.")
    }
};

start();