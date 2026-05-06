<script>
  /**
   * NumberDropdown — a compact SvelteKit-reactive number picker.
   *
   * Props:
   *   value   — the currently selected number (bindable)
   *   options — array of numbers to choose from (default 1-10)
   */

  export let value = 2;
  export let promptsSubmitted = [ false]

  let open = false;

  function select(n) {
    value = n;
    open = false;
  }

  function toggle() {
    open = !open;
  }

  // Close on outside click
  function handleOutsideClick(node) {
    const handler = (e) => {
      if (!node.contains(e.target)) open = false;
    };
    document.addEventListener('click', handler, true);
    return { destroy: () => document.removeEventListener('click', handler, true) };
  }
</script>

<div class="relative inline-block" use:handleOutsideClick>
  <!-- Trigger button -->
  <button
    on:click={toggle}
    class="
      flex items-center gap-1
      px-0 py-0

      text-secondary font-title text-[20px] font-medium
      transition-colors duration-150
      select-none cursor-pointer
    "
    aria-haspopup="listbox"
    aria-expanded={open}
  >
    <span>{value+1}</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 {open ? 'rotate-180' : ''}"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path fill-rule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clip-rule="evenodd"
      />
    </svg>
  </button>

  <!-- Dropdown list -->
  {#if open}
    <ul
      role="listbox"
      class="
        absolute z-50 mt-1 right-0
        min-w-full
        bg-white border border-zinc-200
        rounded-lg shadow-md
        py-0 overflow-hidden
        text-sm font-title
      "
    >
      {#each promptsSubmitted as n, i}

        {#if (n === true)}
          <li
            role="option"
            aria-selected={i === value}
            tabindex="0"
            class="
              px-3 py-1.5 pointer-events-none
              bg-green-600 text-white
              transition-colors duration-100
            "
          >
            {i+1}
          </li>

        {:else }
          <li
          role="option"
          aria-selected={i === value}
          on:click={() => select(i)}
          on:keydown={(e) => e.key === 'Enter' && select(i)}
          tabindex="0"
          class="
            px-3 py-1.5 cursor-pointer
            bg-red-900 text-white hover:bg-red-700
            transition-colors duration-100
          "
        >
          {i+1}
        </li>
        {/if}
      {/each}

        
    </ul>
  {/if}
</div>