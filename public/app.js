$('.toggle-new-key').on('click', function () {
  $('body').toggleClass('new-key-active')
  $('.menu').toggleClass('active')
})

$('.save-new-key').on('click', function () {
  $.ajax({
    type: 'POST',
    url: window.location.pathname + './create',
    data: { key: $('.new-key-name').val() },
    success: function (resp) {
      if (resp.ok) window.location.reload()
    },
    dataType: 'json'
  })
})

$('.btn.show-create-key').on('click', function () {
  $('body').addClass('new-key-active')
})

$('.close-new-key').on('click', function () {
  $('body').removeClass('new-key-active')
})

$('.btn.save-variant').on('click', function () {
  var $textarea = $(this).closest('.group').find('textarea')
  var data = $textarea.data()
  var value = $textarea.val()
  $.ajax({
    type: 'PUT',
    url: window.location.pathname + './update',
    data: { data: data, value: value },
    success: function (resp) {
      if (resp.ok) window.location.reload()
    },
    dataType: 'json'
  })
})

$('.remove-key').on('click', function () {
  if (window.confirm('Are you sure you want to remove this key and all its translations?')) $.ajax({
    type: 'DELETE',
    url: window.location.pathname + './remove',
    data: { key: $(this).data('key') },
    success: function (resp) {
      if (resp.ok) window.location.reload()
    },
    dataType: 'json'
  })
})

$('#menu-button').on('click', function (e) {
  $(this).parent().toggleClass('active')
})
