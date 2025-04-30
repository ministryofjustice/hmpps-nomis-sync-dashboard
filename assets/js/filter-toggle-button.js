import { FilterToggleButton } from '@ministryofjustice/frontend'
import $ from 'jquery'

export default function setupFilterToggle() {
  // eslint-disable-next-line no-new
  new FilterToggleButton(document.querySelector('[data-module="moj-filter"]'), {
    bigModeMediaQuery: '(min-width: 48.063em)',
    startHidden: false,
    toggleButton: {
      showText: 'Show filter',
      hideText: 'Hide filter',
      classes: 'govuk-button--secondary',
    },
    closeButton: {
      text: 'Close',
    },
  })

  $('.moj-filter__options')
    .find(':button')
    .on('click', () => {
      $('#filter-form').submit()
    })
}
