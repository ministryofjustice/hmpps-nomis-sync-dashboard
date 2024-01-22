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
    if (!document.getElementById('startActivitiesMigrationPreviewPage')) {
      return
    }
    async function copyText(textAreaId) {
      const text = document.getElementById(textAreaId).value
      await navigator.clipboard.writeText(text)
    }
    const copyLinkPrefixes = ['copy-suspended']
    copyLinkPrefixes.forEach(prefix => {
      const copyLink = document.getElementById(`${prefix}-link`)
      const copyTextArea = document.getElementById(`${prefix}-text`)
      if (copyLink) {
        if (navigator.clipboard && copyTextArea) {
          copyLink.addEventListener('click', async () => {
            await copyText(`${prefix}-text`)
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
        console.log('initiating page enhancements')
        copyTextToClipboard()
      })
    },
  }
})($, document)

window.pageEnhancements.init()
