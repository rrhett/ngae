# ngae

`ngae` is a command line utility that makes it easier to deploy an Angular app
on Google Appengine.

It is written to be used with @angular/angular-cli.

# Prerequisites

The app makes some rather strong assumptions (these might be loosened over time,
but for now, they are here):

* Your app uses @angular/angular-cli
* You use git to manage your repository
* You will only have a single tag for each released version to Appengine

# Installation

```sh
$ npm install ngae --save
```

# Usage

There are two basic parts to using `ngae`: having your project setup properly,
and issuing the commands.

## Project Setup

This guide assumes you have created a project using `ng new` using
@angular/angular-cli.

### ngae.conf.json

`ngae` assumes the presence of a configuration file, by default located next to
`package.json` in `ngae.conf.json` (commands should allow this filename to be
overridden with `-c` or `--config`).

You need to specify two items in this configuration file:

* `dir`: The relative path to your appengine server code.
* `projectId`: Your Google Cloud project id.

### Appengine server code

The code assumes your `app.yaml` file has the following setup:

```yaml
handlers:
- url: /gc
  static_dir: generated_content
  secure: always
```

Additionally, it assumes control of the `generated_content` and `genfiles`
directories (it will periodically delete these directories when compiling).

You must structure your server code to serve `genfiles/index.html` when you wish
to serve the Angular app.

For example:

```py
jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__))

class Handler(webapp2.RequestHandler):
  def get(self):
    template = jinja_env.get_template('genfiles/index.html')
    self.response.out.write(template.render({}))
```

### Angular development environment

#### Proxy

Finally, to ease maintenance of development and production, you may find it
easiest to run your Angular app with a proxy to your Appengine app. To do this,
create a `proxy.conf.json` file similar to:

```json
{
  "/init": {
    "target": "http://localhost:8080",
    "secure": false
  }
}
```

This will forward `/init` requests to your Appengine development instance.

#### Scripts

Within your `package.json` script, you will want to run `ng serve` using your
proxy:

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve --proxy-config proxy.conf.json"
  }
}
```

Additionally, to setup and run ngae, you can add commands to your scripts:

```json
{
  "scripts": {
    "ngae": "ngae",
    "compile": "ngae compile",
    "run": "ngae run",
    "deploy": "ngae deploy"
  }
}
```

## Commands

Now that you have setup your project, here's what each command does:

### `npm run`

This compiles your Angular app and starts the Appengine development server. If
your app requires authentication, you will need to go to http://localhost:8080
at least once to authenticate on your Appengine environment. When visiting
Appengine directly, it will serve the last version of your Angular app you
compiled.

### `npm compile`

This will recompile the Angular app so directly visiting your Appengine app will
show the latest code. This is good for testing before finally deploying, as this
is the same JavaScript your Appengine app will serve (compiled down, rather than
served dynamically).

### `npm deploy`

This will compile the JavaScript and deploy your app to Appengine. Before doing
this, you MUST `git tag` your commit. You MUST have a single tag on this commit,
and it MUST:

* Not start with ah-
* Not be 'default' or 'latest'
* Match `/^[a-z][a-z0-9-]*$/` as a regular expression (start with a lower case
  letter and contain only lower case letters, numbers and hyphens).

This will deploy to Appengine with a new version name that matches the git tag.
