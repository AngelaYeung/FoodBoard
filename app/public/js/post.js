$(function () {
    var socket = io();
    $('#postForm').submit(function () {
      console.log('Submit triggered!');  
      socket.emit('post item', {
          name: $('#name').val(),
          description: $('#description').val(),
          dateTime: $('#datetimepicker').val()
      });
      return false;
    });
  });