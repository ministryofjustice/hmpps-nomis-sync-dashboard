import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import setupFilterToggle from './filter-toggle-button'
import setupCopyText from './copy-text'

govukFrontend.initAll()
mojFrontend.initAll()

document.addEventListener('DOMContentLoaded', () => {
  const body = document.querySelector('body')
  const pageType = body.getAttribute('data-page')
  switch (pageType) {
    case 'filter-toggle':
      setupFilterToggle()
      break
    case 'copy-text':
      setupCopyText()
      break
  }
})
