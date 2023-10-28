# Tiny Remote Executioner (TRE)

This lightweight Bun-application enables you to reveal scripts for other services to trigger with a simple RESTful HTTP/S API.

Example use-cases:

- A Discord-bot triggers an update for a LinuxGSM server.
- Return information from a virtual machine, like the free memory available.
- Trigger Ansible-playbooks from external sources.

## Performance

- The expected memory footprint is about **13MB** when ran as a PM2 service.
- Filesize about 41 MB + your scripts.

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

1. Add your script(s) to `/scripts`. Make sure to set `chmod +x` permission.
2. Start the server (see above).
3. Your script is now accessible. POST to `/execute` with the following JSON-body:

```json
{
  // The full name of the script-file.
  "script": "name_of_the_script.sh",
  // Optional arguments as an Array.
  "args": []
}
```

## Requirements

- The machine needs to be able to run Bun. This means virtual machines using certain older CPU emulators like kvm64 may not work.
