$(function () {
    var socket = io();
    $('#postForm').submit(function () { 
      socket.emit('post item', {
          name: $('#name').val(),
          description: $('#description').val(),
          dateTime: $('#datetimepicker').val()
      });
      return false;
    });
  });