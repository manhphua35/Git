document.addEventListener('DOMContentLoaded', function() {
  // Mã JavaScript của bạn sẽ được viết ở đây
  const selectedAction = "{{course.action}}";
  const actionSelect = document.getElementById('action');
  for (let i = 0; i < actionSelect.options.length; i++) {
      if (actionSelect.options[i].value === selectedAction) {
          actionSelect.options[i].selected = true;
      }
  }
});
