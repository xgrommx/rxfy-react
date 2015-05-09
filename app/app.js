var Stream,
    slice = [].slice;

Stream = React.createFactory(React.createClass({
    displayName: "Stream",
    getInitialState: function() {
        return {
            disposableStream: new Rx.SingleAssignmentDisposable()
        }
    },
    componentWillMount: function() {
        return this.state.disposableStream.setDisposable(this.props.stream.subscribe(
            function(value) {
                if (value.subscribe !== null && typeof value.subscribe === "function") {
                    this.component = Stream({
                        stream: value
                    });
                } else {
                    this.component = value;
                }
                return this.forceUpdate();
            }.bind(this)
        ));
    },
    componentWillUnmount: function() {
        return this.state.disposableStream.dispose();
    },
    render: function() {
        return this.component || false;
    }
}));

React.streamable = function(factory) {
    return function(props, children) {
        children = slice.call(arguments, 1);
        var args = [props];

        children = children.map(function(value) {
            if (value.subscribe !== null && typeof value.subscribe === "function") {
                return Stream({
                    stream: value
                });
            } else {
                return value;
            }
        });
        return factory.apply(null, args.concat(children));
    };
};

var div = React.streamable(React.DOM.div);
var span = React.streamable(React.DOM.span);

var App = React.createClass({
    displayName: "App",
    getInitialState: function() {
        return {
            s: new Rx.Subject(),
            s2: new Rx.Subject()
        };
    },
    componentDidMount: function() {
        var self = this;
        self.props.stream.take(10).subscribe(function(v) {
            self.state.s.onNext(span({}, v));
            self.state.s2.onNext(span({}, v * 1000));
        }, function(e) {

        },function() {
            self.state.s.onCompleted();
            self.state.s2.onCompleted();
        });
    },
    render: function() {
        return div({}, [
            div({}, "seconds: ", this.state.s),
            div({}, "seconds2: ", this.state.s2)
        ])
    }
});

var stream = Rx.Observable.interval(1000).startWith(0);

React.render(React.createElement(App, {stream: stream}), document.getElementById("container"));