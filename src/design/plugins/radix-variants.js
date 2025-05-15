/**
 * This plugin creates custom Tailwind variants for Radix UI component states
 * 
 * It creates utilities like:
 * - data-[state=open]:
 * - data-[state=checked]:
 * - data-[state=unchecked]:
 * - etc.
 */

export default function plugin({ addVariant }) {
  // Add variants for Radix UI state attributes
  addVariant("state-open", '&[data-state="open"]')
  addVariant("state-closed", '&[data-state="closed"]')
  addVariant("state-checked", '&[data-state="checked"]')
  addVariant("state-unchecked", '&[data-state="unchecked"]')
  addVariant("state-active", '&[data-state="active"]')
  addVariant("state-inactive", '&[data-state="inactive"]')
  addVariant("state-on", '&[data-state="on"]')
  addVariant("state-off", '&[data-state="off"]')
  
  // Add ARIA state variants for improved accessibility
  addVariant("aria-expanded", '&[aria-expanded="true"]')
  addVariant("aria-selected", '&[aria-selected="true"]')
  addVariant("aria-checked", '&[aria-checked="true"]')
  addVariant("aria-disabled", '&[aria-disabled="true"]')
  addVariant("aria-hidden", '&[aria-hidden="true"]')
  
  // Add Radix component specific variants
  addVariant("radix-menu-item", '&[data-radix-menu-item]')
  addVariant("radix-dropdown-item", '&[data-radix-dropdown-menu-item]')
  addVariant("radix-popover", '&[data-radix-popover-content]')
  addVariant("radix-dialog", '&[data-radix-dialog-content]')
  
  // Add focus specific variants
  addVariant("focus-visible-within", "&:has(*:focus-visible)")
  addVariant("focus-visible-ancestor", "&:has(:focus-visible)")
  
  // Add keyboard navigation helper variants
  addVariant("first-of-type", "&:first-of-type")
  addVariant("last-of-type", "&:last-of-type")
  
  // Role-based variants for ARIA roles
  addVariant("role-menu", '&[role="menu"]')
  addVariant("role-menuitem", '&[role="menuitem"]')
  addVariant("role-listbox", '&[role="listbox"]')
  addVariant("role-option", '&[role="option"]')
  addVariant("role-combobox", '&[role="combobox"]')
  
  // Group hover variants for items within popover/menu groups
  addVariant("group-radix-hover", ":merge(.group):hover &")
} 
