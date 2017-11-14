var H5P = H5P || {};

/**
 * Text Input Field module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.TextInputField = (function ($) {
  // CSS Classes:
  var MAIN_CONTAINER = 'h5p-text-input-field';
  var INPUT_LABEL = 'h5p-text-input-field-label';
  var INPUT_FIELD = 'h5p-text-input-field-textfield';
  var WRAPPER_MESSAGE = 'h5p-text-input-field-message-wrapper';
  var CHAR_MESSAGE = 'h5p-text-input-field-message-char';
  var SAVE_MESSAGE = 'h5p-text-input-field-message-save';

  var ariaId = 0;

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @returns {Object} TextInputField TextInputField instance
   */
  function TextInputField(params, id, contentData) {
    this.$ = $(this);
    this.id = id;
    this.contentData = contentData;

    // Set default behavior.
    this.params = $.extend({}, {
      taskDescription: 'Input field',
      placeholderText: '',
      inputFieldSize: '1',
      requiredField: false
    }, params);

    // Set the maximum length for the textarea
    this.maxTextLength = (typeof this.params.maximumLength === 'undefined') ? '' : parseInt(this.params.maximumLength, 10);

    // Get previous state
    if (this.contentData !== undefined && this.contentData.previousState !== undefined) {
      this.previousState = this.contentData.previousState;
    }

    ariaId++;
  }

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  TextInputField.prototype.attach = function ($container) {
    var self = this;
    this.$inner = $container.addClass(MAIN_CONTAINER);

    this.$taskDescription = $('<div>', {
      id: ariaId,
      'class': INPUT_LABEL + (this.params.requiredField ? ' required' : ''),
      'html': self.params.taskDescription
    }).appendTo(self.$inner);

    this.$inputField = $('<textarea>', {
      'class': INPUT_FIELD,
      'rows': parseInt(self.params.inputFieldSize, 10),
      'maxlength': self.maxTextLength,
      'placeholder': self.params.placeholderText,
      'tabindex': '0',
      'aria-required': this.params.requiredField,
      'aria-labelledby': ariaId
    }).appendTo(self.$inner);

    // set state from previous one
    this.setState(this.previousState);

    var $wrapperMessage = $('<div>', {'class': WRAPPER_MESSAGE}).appendTo(self.$inner);
    this.$charMessage = $('<div>', {'class': CHAR_MESSAGE}).appendTo($wrapperMessage);
    this.$saveMessage = $('<div>', {'class': SAVE_MESSAGE});
    if (self.params.maximumLength !== undefined) {
      this.$saveMessage.appendTo($wrapperMessage);
    }
    else {
      this.$saveMessage.appendTo(self.$inner);
    }

    this.$inputField.on('change keyup paste', function() {
      // This will prevent moving DOM elements down on saving for the first time
      self.updateMessageSaved('');
      if (self.params.maximumLength !== undefined) {
        self.$charMessage.html(self.params.remainingChars.replace(/@chars/g, self.computeRemainingChars()));
      }
    });

    this.$inputField.trigger('change');
  };

  /**
   * Returns true if input field is not required or non-empty
   * @returns {boolean} True if input field is filled or not required
   */
  TextInputField.prototype.isRequiredInputFilled = function () {
    if (!this.params.requiredField) {
      return true;
    }

    if (this.params.requiredField && this.$inputField.val().length) {
      return true;
    }

    return false;
  };

  /**
   * Retrieves the text input field
   * @returns {description:string, value:string} Returns input field
   */
  TextInputField.prototype.getInput = function () {
    // Remove trailing newlines
    return {
      description: this.params.taskDescription.replace(/^\s+|\s+$/g, '').replace(/(<p>|<\/p>)/img, ""),
      value: this.$inputField.val()
    };
  };

  /**
   * Get current state for H5P.Question.
   * @return {object} Current state.
   */
  TextInputField.prototype.getCurrentState = function () {
    this.updateMessageSaved(this.params.messageSave);

    // We could have just uses a string, but you never know when you need to store more parameters
    return {
      'inputField': this.$inputField.val()
    };
  };

  /**
   * Set state from previous state.
   * @param {object} previousState - PreviousState.
   */
  TextInputField.prototype.setState = function (previousState) {
    var self = this;

    if (previousState === undefined) {
      return;
    }
    if (typeof previousState === 'object' && !Array.isArray(previousState)) {
      self.$inputField.html(previousState.inputField || '');
    }
  };

  /**
   * Update the indicator message for saved text
   * @param {string} saved - Message to indicate the text was saved
   */
  TextInputField.prototype.updateMessageSaved = function (saved) {
    // Add/remove blending effect
    if (saved === undefined || saved === '') {
      this.$saveMessage.removeClass('h5p-text-input-field-message-save-animation');
    }
    else {
      this.$saveMessage.addClass('h5p-text-input-field-message-save-animation');
    }
    this.$saveMessage.html(saved);
  };

  /**
   * Compute the remaining number of characters
   * @returns {number} Returns number of characters left
   */
  TextInputField.prototype.computeRemainingChars = function() {
    return this.maxTextLength - this.$inputField.val().length;
  };

  return TextInputField;
}(H5P.jQuery));
