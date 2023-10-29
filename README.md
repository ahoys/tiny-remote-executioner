# Tiny Remote Executioner (TRE)

This lightweight Bun-application enables you to reveal scripts for other services to trigger with a simple RESTful HTTP/S API.

Example use-cases:

- A Discord-bot triggers an update for a LinuxGSM server.
- Return information from a virtual machine, like the free memory available.
- Trigger Ansible-playbooks from external sources.

## Performance

- The expected memory footprint is about **13MB** when ran as a PM2 service.
- Filesize about 41 MB + your scripts.

## Requirements

- The machine needs to be able to run Bun. This means virtual machines using certain older CPU emulators like kvm64 may not work.

## How to install & run

```bash
bun install
```

To run:

```bash
bun start
```

To start as a PM2 service (recommended):

```bash
bun pm2
```

Or with your own pm2 service name:

```bash
pm2 start bun --name replace_with_name -- run start
```

## How to use

1. `bun install`
2. Add your script to `./scripts`. Make sure to set the `chmod +x` permission.
3. Start the server `bun start`.

Your script is now accessible via its name. Send multipart form data to `POST => http(s)://ip:port/exec`.

Example: `POST => http://192.168.1.123:3000/exec`

See environment variable "VERBOSE" to return stdout of the script. Otherwise only status code is returned.

| Key    | Type     | Description                                     |
| ------ | -------- | ----------------------------------------------- |
| script | string   | The script to run. E.g. "example.sh".           |
| args   | string[] | Optional arguments (for the script) as strings. |
| files  | File[]   | Optional files as Files.                        |

## Environment Variables

Use .env.production to set the variables. They are all optional.

| Name                 | Description                                | Default     |
| -------------------- | ------------------------------------------ | ----------- |
| HOSTNAME             | The used hostname for the service.         | "localhost" |
| PORT                 | The used port for the service.             | 3000        |
| CERT                 | Path to the cert.pem -file to enable TLS.  | ""          |
| KEY                  | Path to the key.pem -file to enable TLS.   | ""          |
| PASSPHRASE           | Encrypt private key with this passphrase.  | ""          |
| VERBOSE              | true to respond with stdout.               | false       |
| FILES_MAX_COUNT      | Maximum amount of files in one request.    | 0           |
| FILES_MAX_SIZE_IN_KB | Maximum size of a file in kilobytes.       | 0           |
| FILES_EXTENSIONS     | Allowed file extensions. I.e. "jpg, png"   | ""          |
| FILES_DIR            | The location where the files are saved to. | "./files"   |
