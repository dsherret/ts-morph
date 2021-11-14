async function execScript(command: string, args: string[], cwd: string) {
  const p = Deno.run({
    cwd,
    cmd: [command, ...args],
    stderr: "piped",
    stdout: "piped",
  });

  const [status, stdout, stderr] = await Promise.all([
    p.status(),
    p.output(),
    p.stderrOutput(),
  ]);
  p.close();

  if (!status.success) {
    throw new Error(
      `Error executing ${command} ${args.join(" ")}: ${new TextDecoder().decode(stderr)}`,
    );
  }

  return new TextDecoder().decode(stdout);
}

export function execNpmScript(scriptName: string, cwd: string) {
  return execScript(
    "npm",
    ["run", scriptName, "--no-update-notifier", "--scripts-prepend-node-path"],
    cwd,
  );
}
