export type DropDownOption = {
  value: string
  text: string
  selected?: boolean
}

export default function getMigrationTypeDropdown(selectedMigrationType?: string): DropDownOption[] {
  // It's currently not possible to pull these type values from PrisonPersonMigrationFilter.migrationType because they are erased at runtime :(
  return [
    {
      value: '',
      text: '',
      selected: selectedMigrationType === '',
    },
    {
      value: 'PHYSICAL_ATTRIBUTES',
      text: 'Physical Attributes',
      selected: selectedMigrationType === 'PHYSICAL_ATTRIBUTES',
    },
    {
      value: 'PROFILE_DETAILS_PHYSICAL_ATTRIBUTES',
      text: 'Profile Details Physical Attributes',
      selected: selectedMigrationType === 'PROFILE_DETAILS_PHYSICAL_ATTRIBUTES',
    },
  ]
}
