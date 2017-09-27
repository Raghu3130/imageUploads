/**
 * return response in specified format
 */
function ResponseService() {
	/**
	 * @public
	 * @param  string success [true or false]
	 * @param  string message  [message for action]
	 * @param  object data [data]
   * @param  object counts [counts]
   * @return object      [custom object]
	 */
  function _customResponse(success, message, data, counts) {
    var responseObj = {
      success: success,
      message: message,
      data: data,
      counts:counts
    };

    return responseObj;
  }

  return {
    _customResponse: _customResponse
  };

}

module.exports = ResponseService();
