$(() => {

  // View ////////////////////////////////////////////////////////////////////////

  var templateCreated = _.template(`
    <li data-id="<%=id%>" class="todo">
      <span><%=text%></span>
      <button data-action="edit">edit</button>
      <button data-action="done">&#x2714;</button>
      </br>
      </span><span class="createdat">Created At: <%=createTime%>
    </li>
  `);

  var templateUpdated = _.template(`
    <li data-id="<%=id%>" class="todo">
      <span><%=text%></span>
      <button data-action="edit">edit</button>
      <button data-action="done">&#x2714;</button>
      </br>
      <span class="updatedat">Updated At: <%=updateTime%></span> </br>
      </span><span class="createdat">Created At: <%=createTime%>
    </li>
  `);

  var renderTodo = (todo) => {
    return todo.updateTime ? templateUpdated(todo) : templateCreated(todo);
  };

  var addTodo = (todo) => {
    $('#todos').append(renderTodo(todo));
  };

  var changeTodo = (id, todo) => {
    $(`#todos [data-id=${id}]`).replaceWith(renderTodo(todo));
  };

  var removeTodo = (id) => {
    $(`#todos [data-id=${id}]`).remove();
  };

  var addAllTodos = (todos) => {
    _.each(todos, (todo) => {
      addTodo(todo);
    });
  };

  // Controller //////////////////////////////////////////////////////////////////

  $('#form button').click( (event) => {
    var text = $('#form input').val().trim();
    if (text) {
      Todo.create(text, addTodo);
    }
    $('#form input').val('');
  });

  $('#todos').delegate('button', 'click', (event) => {
    var id = $(event.target.parentNode).data('id');
    if ($(event.target).data('action') === 'edit') {
      Todo.readOne(id, (todo) => {
        var updatedText = prompt('Change to?', todo.text);
        if (updatedText !== null && updatedText !== todo.text) {
          Todo.update(id, updatedText, changeTodo.bind(null, id));
        }
      });
    } else {
      Todo.delete(id, removeTodo.bind(null, id));
    }
  });

  // Initialization //////////////////////////////////////////////////////////////

  console.log('CRUDdy Todo client is running the browser');
  Todo.readAll(addAllTodos);

});
