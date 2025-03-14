import { FilterToggleButton } from '@ministryofjustice/frontend'
import $ from 'jquery'

export default function setupFilterToggle() {
  // eslint-disable-next-line no-new
  new FilterToggleButton({
    bigModeMediaQuery: '(min-width: 48.063em)',
    startHidden: false,
    toggleButton: {
      container: $('.moj-action-bar__filter'),
      showText: 'Show filter',
      hideText: 'Hide filter',
      classes: 'govuk-button--secondary',
    },
    closeButton: {
      container: $('.moj-filter'),
      text: 'Close',
    },
    filter: {
      container: $('.moj-filter-layout__filter'),
    },
  })

  $('.moj-filter__options')
    .find(':button')
    .on('click', () => {
      $('#filter-form').submit()
    })
}
