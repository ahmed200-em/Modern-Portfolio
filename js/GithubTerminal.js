{
  const form = document.querySelector("#terminal-form");
  const input = document.querySelector("#terminal-input");
  const output = document.querySelector("#terminal-output");
  const prompt = form?.querySelector('label [aria-hidden="true"]');
  const buttons = document.querySelectorAll(".github-terminal [data-command]");
  const username = "ahmed200-em";

  let repositories;
  let currentRepo = null;
  let folders = [];
  let busy = false;

  function print(text, className = "") {
    const line = document.createElement("p");
    line.className = className;
    line.textContent = text;
    output.append(line);
  }

  function currentPath() {
    return currentRepo ? `~/${[currentRepo.name, ...folders].join("/")}` : "~";
  }

  async function github(endpoint) {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      headers: { Accept: "application/vnd.github+json" },
    });

    if (
      response.status === 429 ||
      (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0")
    ) {
      throw new Error("GitHub’s request limit was reached. Try again later.");
    }

    if (!response.ok) {
      throw new Error(`GitHub could not load that content (${response.status}).`);
    }

    return response.json();
  }

  async function getRepositories() {
    if (repositories) return repositories;

    const results = [];
    for (let page = 1; ; page += 1) {
      const batch = await github(
        `/users/${username}/repos?per_page=100&page=${page}&sort=full_name`
      );
      results.push(...batch);
      if (batch.length < 100) break;
    }

    repositories = results;
    return repositories;
  }

  function getContents(repo, path = []) {
    const encodedPath = path.map(encodeURIComponent).join("/");
    const base = `/repos/${username}/${encodeURIComponent(repo.name)}/contents`;
    return github(encodedPath ? `${base}/${encodedPath}` : base);
  }

  function listFiles(entries) {
    if (!entries.length) {
      print("This folder is empty.");
      return;
    }

    const sorted = [...entries].sort((a, b) => {
      return Number(b.type === "dir") - Number(a.type === "dir") ||
        a.name.localeCompare(b.name);
    });

    sorted.forEach((entry) => {
      print(entry.type === "dir" ? `${entry.name}/` : entry.name);
    });
  }

  async function changeDirectory(name) {
    if (name === "~" || !name) {
      currentRepo = null;
      folders = [];
      return;
    }

    if (name === "..") {
      if (folders.length) folders.pop();
      else currentRepo = null;
      return;
    }

    if (!currentRepo) {
      const repos = await getRepositories();
      const repo = repos.find(
        (entry) => entry.name.toLowerCase() === name.toLowerCase()
      );

      if (!repo) throw new Error(`Repo "${name}" not found. Run ls to see your repos.`);

      const entries = await getContents(repo);
      currentRepo = repo;
      print(repo.description || repo.name);
      listFiles(entries);
      return;
    }

    const entries = await getContents(currentRepo, folders);
    const folder = entries.find((entry) => entry.type === "dir" && entry.name === name);

    if (!folder) throw new Error(`Folder "${name}" not found. Run ls to see this folder.`);

    const nextPath = [...folders, folder.name];
    const children = await getContents(currentRepo, nextPath);
    folders = nextPath;
    listFiles(children);
  }

  async function previewFile(name) {
    if (!currentRepo || !name) {
      throw new Error("Open a repo first, then try cat README.md.");
    }

    const entries = await getContents(currentRepo, folders);
    const entry = entries.find((item) => item.type === "file" && item.name === name);

    if (!entry) throw new Error(`File "${name}" not found. Run ls to see this folder.`);
    if (entry.size > 32_000) throw new Error("This file is too large for the terminal preview.");

    const file = await getContents(currentRepo, [...folders, entry.name]);
    if (file.encoding !== "base64") throw new Error("This file could not be previewed.");

    const bytes = Uint8Array.from(atob(file.content.replace(/\s/g, "")), (char) =>
      char.charCodeAt(0)
    );

    let content;
    try {
      content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new Error("This file is not UTF-8 text.");
    }

    if (content.includes("\0")) throw new Error("This looks like a binary file.");

    const preview = document.createElement("pre");
    preview.className = "github-terminal__file";
    preview.textContent = content.slice(0, 4000);
    output.append(preview);
    if (content.length > 4000) print("… preview truncated");
  }

  async function run(value) {
    const trimmed = value.trim();
    if (!trimmed || busy) return;

    const [command] = trimmed.split(/\s+/, 1);
    const argument = trimmed.slice(command.length).trim();
    busy = true;

    if (command !== "clear") {
      print(`${username}@portfolio:${currentPath()}$ ${trimmed}`, "github-terminal__echo");
    }

    try {
      switch (command) {
        case "help":
          print("ls · cd <repo or folder> · cd .. · cd ~ · pwd · cat <file> · clear");
          break;
        case "ls":
          if (currentRepo) listFiles(await getContents(currentRepo, folders));
          else (await getRepositories()).forEach((repo) => print(`${repo.name}/`));
          break;
        case "repos":
          (await getRepositories()).forEach((repo) => print(`${repo.name}/`));
          break;
        case "cd":
          await changeDirectory(argument);
          break;
        case "pwd":
          print(currentPath());
          break;
        case "cat":
          await previewFile(argument);
          break;
        case "stack":
          print("Portfolio: HTML, CSS, JavaScript · Tempo: React, TypeScript");
          break;
        case "latest":
          await changeDirectory("~");
          await changeDirectory("tempo-daily-planner");
          break;
        case "clear":
          output.replaceChildren();
          break;
        default:
          print(`Unknown command "${command}". Type help for available commands.`);
      }
    } catch (error) {
      print(error.message);
    } finally {
      if (prompt) prompt.textContent = `${username}@portfolio:${currentPath()}$`;
      output.scrollTop = output.scrollHeight;
      busy = false;
    }
  }

  if (form && input && output) {
    if (prompt) prompt.textContent = `${username}@portfolio:${currentPath()}$`;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (busy) return;
      run(input.value);
      input.value = "";
    });

    buttons.forEach((button) => {
      button.addEventListener("click", () => run(button.dataset.command));
    });
  }
}