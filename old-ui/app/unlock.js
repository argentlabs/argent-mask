const inherits = require('util').inherits
const Component = require('react').Component
const h = require('react-hyperscript')
const connect = require('react-redux').connect
const actions = require('../../ui/app/actions')
const getCaretCoordinates = require('textarea-caret')
const EventEmitter = require('events').EventEmitter

const Mascot = require('./components/mascot')

module.exports = connect(mapStateToProps)(UnlockScreen)

inherits(UnlockScreen, Component)

function UnlockScreen() {
  Component.call(this)
  this.animationEventEmitter = new EventEmitter()
}

function mapStateToProps(state) {
  return {
    warning: state.appState.warning,
  }
}

UnlockScreen.prototype.render = function () {
  const state = this.props
  const warning = state.warning
  return (
      h('.unlock-screen.flex-column.flex-center.flex-grow', [

        // h(Mascot, {
        //   animationEventEmitter: this.animationEventEmitter,
        // }),

        h('.logo-stacked', [
          h('div.ren'),
          h('h1.text-wordmark', 'argent'),
          h('div.powered-by', 'Powered by MetaMask'),
        ]),

        h('div.form-group', [

          h('input.form-control', {
            type: 'password',
            id: 'password-box',
            placeholder: 'enter password',
            style: {},
            onKeyPress: this.onKeyPress.bind(this),
            onInput: this.inputChanged.bind(this),
          }),

          h('.error', {
            style: {
              display: warning ? 'block' : 'none',
            },
          }, warning),
        ]),


        h('button.login', {
          onClick: this.onSubmit.bind(this),
        }, 'Log in'),


        h('a.new-key', {
          href: '#',
          // onClick: () => this.props.dispatch(actions.forgotPassword()),
          onClick: () => this.props.dispatch(actions.markPasswordForgotten()),
          // }, 'Restore from seed phrase'),
        }, 'Generate new browser key'),
      ])
  )
}

UnlockScreen.prototype.componentDidMount = function () {
  document.getElementById('password-box').focus()
}

UnlockScreen.prototype.onSubmit = function (event) {
  const input = document.getElementById('password-box')
  const password = input.value
  this.props.dispatch(actions.tryUnlockMetamask(password))
}

UnlockScreen.prototype.onKeyPress = function (event) {
  if (event.key === 'Enter') {
    this.submitPassword(event)
  }
}

UnlockScreen.prototype.submitPassword = function (event) {
  var element = event.target
  var password = element.value
  // reset input
  element.value = ''
  this.props.dispatch(actions.tryUnlockMetamask(password))
}

UnlockScreen.prototype.inputChanged = function (event) {
  // tell mascot to look at page action
  var element = event.target
  var boundingRect = element.getBoundingClientRect()
  var coordinates = getCaretCoordinates(element, element.selectionEnd)
  this.animationEventEmitter.emit('point', {
    x: boundingRect.left + coordinates.left - element.scrollLeft,
    y: boundingRect.top + coordinates.top - element.scrollTop,
  })
}
