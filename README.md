# Tiny Remote Executioner (TRE)

TRE is a lightweight Bun-application that allows you to expose scripts for other services to execute via a simple RESTful HTTP/S API.

## Use Cases

- Triggering a LinuxGSM server update through a Discord bot.
- Retrieving information such as available free memory from a virtual machine.
- Executing Ansible-playbooks from external sources.

## Performance

- TRE has a memory footprint of approximately **13MB** when run as a PM2 service.
- The total file size is about 41MB, excluding your scripts.

## Requirements

- The host machine must be capable of running Bun. Some older CPU emulators like kvm64 may not be compatible.

## Installation & Running

To install, use the command:

```bash
bun install
```

To run the application:

```bash
bun start
```

To start as a PM2 service (recommended):

```bash
bun pm2
```

Or to start with your own PM2 service name:

```bash
pm2 start bun --name replace_with_name -- run start
```

## Usage

1. Install the application using `bun install`.
2. Add your script to the `./scripts` directory. Ensure the `chmod +x` permission is set.
3. Start the server with `bun start`.

Your script can now be accessed via its name. Send multipart form data to `POST => http(s)://ip:port/exec`.

Example: `POST => http://192.168.1.123:3000/exec`

Set the environment variable "VERBOSE" to true to return the stdout of the script. By default, only the status code is returned.

| Key    | Type     | Description                                   |
| ------ | -------- | --------------------------------------------- |
| script | string   | The script to run, e.g., "example.sh".        |
| args   | string[] | Optional arguments for the script as strings. |
| files  | File[]   | Optional files.                               |

## Environment Variables

Use .env.production to set the variables. All variables are optional.

| Name                 | Description                                | Default     |
| -------------------- | ------------------------------------------ | ----------- |
| HOSTNAME             | The hostname for the service.              | "localhost" |
| PORT                 | The port for the service.                  | 3000        |
| CERT                 | Path to the cert.pem file to enable TLS.   | ""          |
| KEY                  | Path to the key.pem file to enable TLS.    | ""          |
| PASSPHRASE           | Passphrase to encrypt the private key.     | ""          |
| VERBOSE              | Set to true to respond with stdout.        | false       |
| FILES_MAX_COUNT      | Maximum number of files in one request.    | 0           |
| FILES_MAX_SIZE_IN_KB | Maximum size of a file in kilobytes.       | 0           |
| FILES_EXTENSIONS     | Allowed file extensions, e.g., "jpg, png". | ""          |
| FILES_DIR            | Directory where the files are saved.       | "./files"   |
