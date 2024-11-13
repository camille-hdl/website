---
title: An Ansible lab with Podman on macos
date: "2024-11-13T18:00:00.000Z"
description: Use Podman containers to emulate "normal" virtual machines to try out Ansible playbooks
---

By "Ansible laboratory", I mean a collection of virtual servers on which you can test your ansible playbooks.  
Containers are a somewhat good fit, since you can easily create machines using your base image of choice and discard them as needed without the hassle of managing actual VMs.  

My goal here is to create an Ansible lab with Docker containers with the following features:

- Debian base image,
- systemctl available,
- a single Controller with ansible installed,
- an arbitrary number of node containers for Ansible to target,
- ssh enabled between machines and secured by a key.

<h3><a href="https://gist.github.com/camille-hdl/48844e9cfb8223793b1d1a6cf9254ee1" target="_blank" rel="noreferrer noopener">Get the code here.</a></h3>

<aside class="my-comment">
<p>
Github Gists don't support subdirectories (or maybe I don't know how to do it), so you can replace <code>-</code> by <code>/</code> in filenames to recreate the intended file hierarchy.  <br />
For example, <code>lab-Containerfiles-controller-Containerfile</code> means <code>lab/Containerfiles/controller/Containerfile</code>.
</p>
</aside>

## Prerequisites and warnings

- This was tested on macos 15 with Apple silicon.
- [Podman Desktop](https://podman-desktop.io) (or just podman) installed on your machine.
- YOU NEED TO ADD A KEY PAIR IN THE `lab/Containerfiles/controller/` directory and the public key in `lab/Containerfiles/node/`. See more details in the Containerfiles.
- If, as in my example, you need sshfs, you need macfuse https://osxfuse.github.io and the `--device /dev/fuse` option when running `podman run`.
- Remember that if your host machine runs on Apple silicon, your arch will be detected as darwin-aarch64 or arm64. This may impact which version of Java you may want to run in your containers for example.

<aside class="my-comment">
    <p>
        <strong>Why Podman instead of Docker?</strong><br />
        Some Docker limitations make doing this more painful than it should be.<br />
        For example, it's difficult to make systemd work on Docker machines when its a common way of managing services in the Linux world.<br />
        Podman supports systemd out of the box.
        <br />
        <br />
        <strong>Why not podman-compose?</strong><br />
        I find that starting containers using <code>podman run</code> from a script gives more control when using <code>--add-cap</code> and <code>--device</code>.
    </p>
</aside>


<section class="warning">
<p>
<strong>Limitations</strong>
Unfortunately, I have not found a way to make firewalls such as nftables or firewalld work from within the containers.  <br />
Podman and Docker handle networking in a very different way from a non-containerized VM and, to my knowledge, have no plans to support this since this is very much outside of their intended use case.
</p>
</section>

## Building the images

```
>lab/$ ./scripts/build-images.sh
```

## Starting the lab

```
>lab/$ ./start.sh
```

Then, assuming your Ansible configuration and playbooks are in an `ansible/` directory next to `lab/`:

Configure your inventory, for example `ansible/inventories/lab/hosts.yml`. To reference a node, simply use `lab_node1` for example.

Run your playbooks:  
```shell
# in the Controller
cd ansible

# if you have `requirements.yml`
ansible-galaxy install -r requirements.yml

# run your playbooks
ansible-playbook -i inventories/lab/hosts.yml playbooks/your-playbook.yml
```
