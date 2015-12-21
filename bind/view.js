class View extends Class {
    constructor() {
      super();  
      this.people = [
  		{
	        name: 'Ashley',
	        hobbies: [
	            { label: 'programming' },
	            { label: 'poetry' },
	            { label: 'knitting' }
	        ],
	        addHobby: function addHobby() {
			    this.hobbies.push({
			        label: ''
			    });
			}
	    }, 
	    {
	        name: 'Noor',
	        hobbies: [],
	        addHobby: function addHobby() {
			    this.hobbies.push({
			        label: ''
			    });
			}
		}
	];
	this.binders = {
        /*
		    value: function(node, onchange) {
		        node.addEventListener('keyup', () => {
		            onchange(node.value);
		        });
		        return {
		            updateProperty: function(value) {
		                if (value !== node.value) {
		                    node.value = value;
		                }
		            }
		        };
		    },
		    count: function(node) {
		        return {
		            updateProperty: function(value) {
		                node.textContent = String(value).length;
		            }
		        };
		    },
        */
		    click: function(node, onchange, object) {
		        var previous;
		        return {
		            updateProperty: function(fn) {
		                var listener = function(e) {
		                    fn.apply(object, arguments);
		                    e.preventDefault();
		                };
		                if (previous) {
		                    node.removeEventListener(previous);
		                    previous = listener;
		                }
		                node.addEventListener('click', listener);
		            }
		        };
		    }
		};
    }

    showStructure(...rest) {
        console.log(rest);
	    //alert(JSON.stringify(this, null, 4));
	}

	onlyDirectNested(container, selector) {
        let collection = container.querySelectorAll(selector);
        return Array.prototype.filter.call(collection, this['isDirectNested']);
    }

    isDirectNested(node) {
        node = node.parentElement;
        while (node) {
            if (node.dataset.repeat) {
                return false;
            }
            node = node.parentElement;
        }
        return true;
    }

    bindModel(container, object) {
        var bindings = this.onlyDirectNested(container, '[data-bind]').map((node) => {
            var parts = node.dataset.bind.split(' ');
            return this.bindObject(node, parts[0], object, parts[1]);
        }, this)/*.concat(this.onlyDirectNested(container, '[data-repeat]').map((node) => {
            return this.bindCollection(node, object[node.dataset.repeat]);
        }, this))*/;

        return {
            unobserve: function() {
                bindings.forEach(function(binding) {
                    binding.unobserve();
                });
            }
        };
    }
    /*
    bindCollection(node, array) {
    	function capture(original) {
            var before = original.previousSibling;
            var parent = original.parentNode;
            var node = original.cloneNode(true);
            original.parentNode.removeChild(original);
            return {
                insert: function() {
                    var newNode = node.cloneNode(true);
                    parent.insertBefore(newNode, before);
                    return newNode;
                }
            };
        }

        delete node.dataset.repeat;
        var parent = node.parentNode;
        var captured = capture(node);
        var bindItem = (function(element) {
            return this.bindModel(captured.insert(), element);
        }).bind(this);
        var bindings = array.map(bindItem);
        var observer = function(changes) {
            changes.forEach(function(change) {
            	console.log(change);
                var index = parseInt(change.name, 10), child;
                if (isNaN(index)) return;
                if (change.type === 'add') {
                    bindings.push(bindItem(array[index]));
                } else if (change.type === 'update') {
                	console.log('update');
                    bindings[index].unobserve();
                    bindModel(parent.children[index], array[index]);
                } else if (change.type === 'delete') {
                	console.log('delete');
                    bindings.pop().unobserve();
                    child = parent.children[index];
                    child.parentNode.removeChild(child);
                }
            });
        };
        Object.observe(array, observer);
        return {
            unobserve: function() {
                Object.unobserve(array, observer);
            }
        };
    }
    */
    bindObject(node, binderName, object, propertyName) {
        var binder = this.binders[binderName](node, (v) => {object[propertyName] = v;}, object);
        binder.updateProperty(object[propertyName]);
        var observer = function(changes) {
            var changed = changes.some((change) => change.name === propertyName);
            if (changed) {
                binder.updateProperty(object[propertyName]);
            }
        };
        Object.observe(object, observer);
        return {
            unobserve: function() {
                Object.unobserve(object, observer);
            }
        };
    }

}
export default View;