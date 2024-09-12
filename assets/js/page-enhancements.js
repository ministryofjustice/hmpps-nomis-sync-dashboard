/**
 * Script file to apply progressive enhancement techniques to page elements.
 * Any code here should be used only to enhance the page and UX if the user has JS enabled.
 *
 * If the user does not have JS enabled, or the code within this script does not run for some reason
 * the application should fall back to standard HTML functionality and should continue to operate.
 *
 * No code should be written here that renders a page non-functional if JS is not enabled or the script does not run/fails.
 */
window.pageEnhancements = (($, document) => {
  const copyTextToClipboard = () => {
    if (
      !document.getElementById('startActivitiesMigrationPreviewPage') &&
      !document.getElementById('startAppointmentsMigrationPreviewPage')
    ) {
      return
    }
    const copyLinkPrefixes = [
      'copy-suspended',
      'copy-missing-pay-band',
      'copy-pay-rates-no-incentive',
      'copy-appointment-counts',
    ]

    async function copyText(copyLinkPrefix) {
      clearConfirmations()
      const text = document.getElementById(`${copyLinkPrefix}-text`).value
      await navigator.clipboard
        .writeText(text)
        .then(() => {
          document.getElementById(`${copyLinkPrefix}-confirmed`).classList.remove('govuk-visually-hidden')
        })
        .catch(() => {
          document.getElementById(`${copyLinkPrefix}-failed`).classList.remove('govuk-visually-hidden')
        })
    }

    function clearConfirmations() {
      for (let confirmation of document.getElementsByClassName('copy-link-confirmation')) {
        confirmation.classList.add('govuk-visually-hidden')
      }
    }

    copyLinkPrefixes.forEach(prefix => {
      const copyLink = document.getElementById(`${prefix}-link`)
      const copyTextArea = document.getElementById(`${prefix}-text`)
      if (copyLink) {
        if (navigator.clipboard && copyTextArea) {
          copyLink.addEventListener('click', async () => {
            await copyText(prefix)
          })
        } else {
          copyLink.classList.add('govuk-visually-hidden')
        }
      }
    })
  }

  return {
    init: () => {
      $(() => {
        copyTextToClipboard()
      })
    },
  }
})($, document)

window.pageEnhancements.init()
