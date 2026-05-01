const childProcess = require("node:child_process");
const { syncBuiltinESMExports } = require("node:module");

const originalExec = childProcess.exec;

childProcess.exec = function patchedExec(command, options, callback) {
  let normalizedOptions = options;
  let normalizedCallback = callback;

  if (typeof normalizedOptions === "function") {
    normalizedCallback = normalizedOptions;
    normalizedOptions = undefined;
  }

  if (
    typeof command === "string" &&
    command.trim().toLowerCase() === "net use"
  ) {
    const fakeChild = {
      pid: 0,
      kill() {
        return true;
      },
      on() {
        return fakeChild;
      },
      once() {
        return fakeChild;
      },
      addListener() {
        return fakeChild;
      },
      removeListener() {
        return fakeChild;
      },
      stdout: null,
      stderr: null,
    };

    queueMicrotask(() => {
      if (normalizedCallback) normalizedCallback(null, "", "");
    });

    return fakeChild;
  }

  return originalExec(command, normalizedOptions, normalizedCallback);
};

syncBuiltinESMExports();
