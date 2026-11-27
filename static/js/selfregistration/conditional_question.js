document.addEventListener("DOMContentLoaded", () => {
  const version = document.querySelector("select[data-conditional-options]");
  if (!version) return;

  const fields = [version, ...["target", "trigger_question", "trigger_choice"].map(name =>
    version.form.elements.namedItem(name)
  )];
  const emptyLabel = fields[1].options[0].text;
  const status = document.createElement("span");
  status.setAttribute("role", "status");
  fields.at(-1).after(status);
  let pending;

  fields.forEach((field, index) => {
    if (index > 0) field.disabled = !fields[index - 1].value || field.options.length <= 1;
    if (index === fields.length - 1) return;

    field.addEventListener("change", async () => {
      pending?.abort();
      status.textContent = "";
      fields.slice(index + 1).forEach(dependent => {
        dependent.replaceChildren(new Option(emptyLabel, ""));
        dependent.disabled = true;
      });
      if (!field.value) return;

      const dependent = fields[index + 1];
      const url = new URL(version.dataset.conditionalOptions, window.location.origin);
      url.searchParams.set("field", dependent.name);
      fields.slice(0, index + 1).forEach(parent => url.searchParams.set(parent.name, parent.value));
      const controller = new AbortController();
      pending = controller;

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const { options } = await response.json();
        if (controller.signal.aborted) return;
        options.forEach(option => dependent.add(new Option(option.label, option.id)));
        dependent.disabled = options.length === 0;
        if (!options.length) status.textContent = version.dataset.noOptions;
      } catch (error) {
        if (error.name !== "AbortError") status.textContent = version.dataset.loadingError;
      }
    });
  });
});
