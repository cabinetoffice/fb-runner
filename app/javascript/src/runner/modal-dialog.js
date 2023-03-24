import { nodeListForEach } from 'govuk-frontend/govuk/common.js'
import 'govuk-frontend/govuk-esm/vendor/polyfills/Element/prototype/classList'
import 'govuk-frontend/govuk-esm/vendor/polyfills/Function/prototype/bind'
import 'govuk-frontend/govuk-esm/vendor/polyfills/Event'

function ModalDialog ($module) {
  this.$module = $module
  this.$dialogBox = $module.querySelector('dialog')
  this.$container = document.documentElement

  // Allowed focussable elements
  this.focussable = [
    'button',
    '[href]',
    'input',
    'select',
    'textarea'
  ]
}

// Initialize component
ModalDialog.prototype.init = function (options) {
// Check for module
  if (!this.$module) {
    return
  }

  this.options = options || {}

  this.open = this.handleOpen.bind(this)
  this.close = this.handleClose.bind(this)
  this.focus = this.handleFocus.bind(this)
  this.focusTrap = this.handleFocusTrap.bind(this)
  this.boundKeyDown = this.handleKeyDown.bind(this)

  // Modal elements
  this.$closeButtons = this.$dialogBox.querySelectorAll('[data-element="govuk-modal-dialogue-close"]')
  this.$focussable = this.$dialogBox.querySelectorAll(this.focussable.toString())
  this.$focusableLast = this.$focussable[this.$focussable.length - 1]
  this.$focusElement = this.options.focusElement || this.$dialogBox
  console.log(this.$module.dataset)
  this.$inertContainer = document.querySelector( this.$module.dataset.inertContainer || '.govuk-modal-dialogue-inert-container' )
  console.log(this.$inertContainer)

  // Check that dialog element has native or polyfill support
  if (!this.dialogSupported()) {
    if (typeof this.options.onDialogNotSupported === 'function') {
      this.options.onDialogNotSupported.call()
    }
    return
  }

  if (this.$dialogBox.hasAttribute('open')) {
    this.open()
  }

  this.initEvents()

  return this
}

ModalDialog.prototype.dialogSupported = function () {
  if (typeof HTMLDialogElement === 'function') {
    // Native dialog is supported by browser
    return true
  } else {
    // Native dialog is not supported by browser so use polyfill
    try {
      window.dialogPolyfill.registerDialog(this.$dialog)
      return true
    } catch (error) {
      // Doesn't support polyfill (IE8) - display fallback element
      return false
    }
  }
}
// Initialize component events
ModalDialog.prototype.initEvents = function (options) {
  if (this.options.triggerElement) {
    this.options.triggerElement.addEventListener('click', this.open)
  }

  // Close dialogue on close button click
  nodeListForEach(this.$closeButtons, function(element) {
    element.addEventListener('click', this.close.bind(this));
  }.bind(this));
}

// Open modal
ModalDialog.prototype.handleOpen = function (event) {
  if (event) {
    event.preventDefault()
  }

  // Save last-focussed element
  this.$lastActiveElement = document.activeElement

  // Disable scrolling, show wrapper
  this.$container.classList.add('govuk-!-scroll-disabled')
  this.$module.classList.add('govuk-modal-dialogue--open')
  this.$inertContainer.inert = true
  this.$inertContainer.setAttribute('aria-hidden', 'true')

  // Close on escape key, trap focus
  document.addEventListener('keydown', this.boundKeyDown, true)

  // Optional 'onOpen' callback
  if (typeof this.options.onOpen === 'function') {
    this.options.onOpen.call(this)
  }

  // Skip open if already open
  if (this.$dialogBox.hasAttribute('open')) {
    return
  }

  // Show modal
  this.$dialogBox.setAttribute('open', '')

  // Handle focus
  this.focus()
}

// Close modal
ModalDialog.prototype.handleClose = function (event) {
  if (event) {
    event.preventDefault()
  }

  // Skip close if already closed
  if (!this.$dialogBox.hasAttribute('open')) {
    return
  }

  // Hide modal
  this.$dialogBox.removeAttribute('open')

  // Hide wrapper, enable scrolling
  this.$module.classList.remove('govuk-modal-dialogue--open')
  this.$container.classList.remove('govuk-!-scroll-disabled')
  this.$inertContainer.inert = false
  this.$inertContainer.setAttribute('aria-hidden', 'false')

  // Restore focus to last active element
  this.$lastActiveElement.focus()

  // Optional 'onClose' callback
  if (typeof this.options.onClose === 'function') {
    this.options.onClose.call(this)
  }

  // Remove escape key and trap focus listener
  document.removeEventListener('keydown', this.boundKeyDown, true)
}

ModalDialog.prototype.isOpen = function() {
  return this.$dialogBox.hasAttribute('open');
}

// Lock scroll, focus modal
ModalDialog.prototype.handleFocus = function () {
  this.$dialogBox.scrollIntoView()
  this.$focusElement.focus({ preventScroll: true })
}

// Ensure focus stays within modal
ModalDialog.prototype.handleFocusTrap = function (event) {
  var $focusElement

  // Check for tabbing outside dialog
  var hasFocusEscaped = document.activeElement !== this.$dialogBox

  // Loop inner focussable elements
  if (hasFocusEscaped) {
    nodeListForEach(this.$focussable, function (element) {
      // Actually, focus is on an inner focussable element
      if (hasFocusEscaped && document.activeElement === element) {
        hasFocusEscaped = false
      }
    })

    // Wrap focus back to first element
    $focusElement = hasFocusEscaped
      ? this.$dialogBox
      : undefined
  }

  // Wrap focus back to first/last element
  if (!$focusElement) {
    if ((document.activeElement === this.$focusableLast && !event.shiftKey) || !this.$focussable.length) {
      $focusElement = this.$dialogBox
    } else if (document.activeElement === this.$dialogBox && event.shiftKey) {
      $focusElement = this.$focusableLast
    }
  }

  // Wrap focus
  if ($focusElement) {
    event.preventDefault()
    $focusElement.focus({ preventScroll: true })
  }
}

// Listen for key presses
ModalDialog.prototype.handleKeyDown = function (event) {
  var KEY_TAB = 9
  var KEY_ESCAPE = 27

  switch (event.keyCode) {
    case KEY_TAB:
      this.focusTrap(event)
      break

    case KEY_ESCAPE:
      this.close()
      break
  }
}

export default ModalDialog
