export default function setupCopyText() {
  const copyLinkPrefixes = [
    'copy-suspended',
    'copy-missing-pay-band',
    'copy-pay-rates-no-incentive',
    'copy-activities-without-schedule-rules',
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
        copyLink.addEventListener('click', async e => {
          e.preventDefault()
          await copyText(prefix)
        })
      } else {
        copyLink.classList.add('govuk-visually-hidden')
      }
    }
  })
}
