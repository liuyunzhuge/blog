
var app = getApp();

Page( {
    data: {
        todos: [],
        todosOfUncomplted: [],
        todosOfComplted: [],
        newTodoText: '',
        addOneLoading: false,
        loadingHidden: true,
        loadingText: '',
        toastHidden: true,
        toastText: '',
        clearAllLoading: false
    },
    updateData: function( resetTodos ) {
        var data = {};
        if( resetTodos ) {
            data.todos = this.data.todos;
        }

        data.todosOfUncomplted = this.data.todos.filter( function( t ) {
            return !t.complete;
        });

        data.todosOfComplted = this.data.todos.filter( function( t ) {
            return t.complete;
        });

        this.setData( data );
    },
    updateStorage: function() {
        var storage = [];
        this.data.todos.forEach( function( t ) {
            storage.push( {
                id: t.id,
                text: t.text,
                complete: t.complete
            })
        });

        wx.setStorageSync( 'todos', storage );
    },
    onLoad: function() {
        this.setData( {
            todos: wx.getStorageSync( 'todos' ) || []
        });
        this.updateData( false );
    },
    getTodo: function( id ) {
        return this.data.todos.filter( function( t ) {
            return id == t.id;
        })[ 0 ];
    },
    getTodoId: function( e, prefix ) {
        return e.currentTarget.id.substring( prefix.length );
    },
    toggleTodo: function( e ) {

        var id = this.getTodoId( e, 'todo-item-chk-' );
        var value = e.detail.value[ 0 ];
        var complete = !!value;
        var todo = this.getTodo( id );

        todo.complete = complete;
        this.updateData( true );
        this.updateStorage();
    },
    toggleAll: function( e ) {
        var value = e.detail.value[ 0 ];
        var complete = !!value;

        this.data.todos.forEach( function( t ) {
            t.complete = complete;
        });

        this.updateData( true );
        this.updateStorage();

    },
    clearTodo: function( id ) {
        var targetIndex;
        this.data.todos.forEach( function( t, i ) {
            if( targetIndex !== undefined ) return;

            if( t.id == id ) {
                targetIndex = i;
            }
        });

        this.data.todos.splice( targetIndex, 1 );
    },
    clearSingle: function( e ) {
        var id = this.getTodoId( e, 'btn-del-item-' );
        var todo = this.getTodo( id );

        todo.loading = true;
        this.updateData( true );

        var that = this;
        setTimeout( function() {
            that.clearTodo( id );
            that.updateData( true );
            that.updateStorage();
        }, 500 );
    },
    clearAll: function() {
        this.setData( {
            clearAllLoading: true
        });

        var that = this;
        setTimeout( function() {
            that.data.todosOfComplted.forEach( function( t ) {
                that.clearTodo( t.id );
            });
            that.setData( {
                clearAllLoading: false
            });
            that.updateData( true );
            that.updateStorage();

            that.setData( {
                toastHidden: false,
                toastText: 'Success'
            });
        }, 500 );

    },
    startEdit: function( e ) {
        var id = this.getTodoId( e, 'todo-item-txt-' );
        var todo = this.getTodo( id );
        todo.editing = true;

        this.updateData( true );
        this.updateStorage();
    },
    newTodoTextInput: function( e ) {
        this.setData( {
            newTodoText: e.detail.value
        });
    },
    endEditTodo: function( e ) {
        var id = this.getTodoId( e, 'todo-item-edit-' );
        var todo = this.getTodo( id );

        todo.editing = false;
        todo.text = e.detail.value;

        this.updateData( true );
        this.updateStorage();
    },
    addOne: function( e ) {
        if( !this.data.newTodoText ) return;

        this.setData( {
            addOneLoading: true
        });

        //open loading
        this.setData( {
            loadingHidden: false,
            loadingText: 'Waiting...'
        });

        var that = this;
        setTimeout( function() {
            //close loading and toggle button loading status
            that.setData( {
                loadingHidden: true,
                addOneLoading: false,
                loadingText: ''
            });

            that.data.todos.push( {
                id: app.getId(),
                text: that.data.newTodoText,
                compelte: false
            });

            that.setData( {
                newTodoText: ''
            });

            that.updateData( true );
            that.updateStorage();
        }, 500 );
    },
    loadingChange: function() {
        this.setData( {
            loadingHidden: true,
            loadingText: ''
        });
    },
    toastChange: function() {
        this.setData( {
            toastHidden: true,
            toastText: ''
        });
    }
});
