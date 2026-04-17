const customSelectRoots = document.querySelectorAll("[data-custom-select]");

customSelectRoots.forEach((root) => {
  const nativeSelect = root.querySelector("select");
  const trigger = root.querySelector(".custom-select-trigger");
  const valueNode = root.querySelector(".custom-select-value");
  const dropdown = root.querySelector(".custom-select-dropdown");

  if (!nativeSelect || !trigger || !valueNode || !dropdown) {
    return;
  }

  const options = Array.from(nativeSelect.options);
  const optionNodes = new Map();
  let activeIndex = options.findIndex((option) => option.selected);
  let selectedIndex = activeIndex >= 0 ? activeIndex : 0;

  const closeDropdown = () => {
    root.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    dropdown.hidden = true;
  };

  const setActiveOption = (nextIndex) => {
    activeIndex = nextIndex;
    optionNodes.forEach((node, index) => {
      node.classList.toggle("is-active", index === activeIndex);
    });
  };

  const updateSelectedUI = () => {
    const selectedOption = options[selectedIndex];
    if (!selectedOption) {
      return;
    }

    valueNode.textContent = selectedOption.text;
    optionNodes.forEach((node, index) => {
      node.classList.toggle("is-selected", index === selectedIndex);
      node.setAttribute("aria-selected", index === selectedIndex ? "true" : "false");
    });
  };

  const selectOption = (index) => {
    const option = options[index];
    if (!option || option.value === nativeSelect.value) {
      closeDropdown();
      return;
    }

    nativeSelect.value = option.value;
    selectedIndex = index;
    setActiveOption(index);
    updateSelectedUI();
    closeDropdown();
    nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
  };

  options.forEach((option, index) => {
    const optionNode = document.createElement("li");
    optionNode.className = "custom-select-option";
    optionNode.setAttribute("role", "option");
    optionNode.dataset.value = option.value;
    optionNode.textContent = option.text;

    optionNode.addEventListener("click", () => {
      selectOption(index);
    });

    optionNode.addEventListener("mouseenter", () => {
      setActiveOption(index);
    });

    dropdown.appendChild(optionNode);
    optionNodes.set(index, optionNode);
  });

  setActiveOption(selectedIndex);
  updateSelectedUI();

  trigger.addEventListener("click", () => {
    const isOpen = root.classList.contains("is-open");
    if (isOpen) {
      closeDropdown();
      return;
    }

    root.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    dropdown.hidden = false;
    setActiveOption(selectedIndex);
  });

  trigger.addEventListener("keydown", (event) => {
    const isClosed = !root.classList.contains("is-open");

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (isClosed) {
        trigger.click();
        return;
      }

      const direction = event.key === "ArrowDown" ? 1 : -1;
      const next = (activeIndex + direction + options.length) % options.length;
      setActiveOption(next);
      optionNodes.get(next)?.scrollIntoView({ block: "nearest" });
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isClosed) {
        trigger.click();
      } else {
        selectOption(activeIndex);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();
    }
  });

  nativeSelect.addEventListener("change", () => {
    const nextSelected = options.findIndex((option) => option.value === nativeSelect.value);
    selectedIndex = nextSelected >= 0 ? nextSelected : 0;
    setActiveOption(selectedIndex);
    updateSelectedUI();
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) {
      closeDropdown();
    }
  });
});
