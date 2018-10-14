/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// ------------------------------------------------
// CustomEvent polyfill
// ------------------------------------------------
if (typeof window !== 'undefined' && typeof window.CustomEvent !== 'function') {
    var CustomEventPollyfill = function (event, userParams) {
        var params = {
            bubbles: userParams.bubbles || false,
            cancelable: userParams.cancelable || false,
            detail: userParams.detail || undefined // eslint-disable-line no-undefined
        };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    };
    CustomEventPollyfill.prototype = window.Event.prototype;
    window.CustomEvent = CustomEventPollyfill;
}

const ScrollContainer = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    overflow-y: scroll;
    ::-webkit-scrollbar{
        display: none;
    }
`;

class ScrollManager extends React.Component {
    constructor(props) {
        super(props);
        this.SCROLL_EVENT = `${props.managerId}-scroll`;
        this.READY_EVENT = `${props.managerId}-ready`;
        this.ticking = false;

        // bindings
        this.getScrollPosition = this.getScrollPosition.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }
    componentDidMount() {
        this.scrollTarget.addEventListener('scroll', this.handleScroll);
        const readyEvent = new CustomEvent(this.READY_EVENT, {
            getScrollPosition: this.getScrollPosition()
        });

        // Dispatch the ready event.
        window.dispatchEvent(readyEvent);
    }
    componentWillUnmount() {
        this.scrollTarget.removeEventListener('scroll', this.handleScroll);
    }
    getScrollPosition() {
        var scrollPositionY = this.scrollTarget.scrollY || this.scrollTarget.scrollTop;
        var scrollPositionX = this.scrollTarget.scrollX || this.scrollTarget.scrollLeft;

        // Disable overscrolling in safari
        if (scrollPositionY < 0) {
            scrollPositionY = 0;
        }
        if (scrollPositionX < 0) {
            scrollPositionX = 0;
        }

        return {
            scrollPositionY: scrollPositionY,
            // Alias for scrollPositionY for backwards compatibility
            scrollPosition: scrollPositionY,
            scrollPositionX: scrollPositionX
        };
    }
    handleScroll() {
        // Fire the event only once per requestAnimationFrame
        if (!this.ticking) {
            this.ticking = true;
            var self = this;

            window.requestAnimationFrame(function () {
                var event = new CustomEvent(self.SCROLL_EVENT, {
                    detail: self.getScrollPosition()
                });

                // Dispatch the event.
                window.dispatchEvent(event);
                self.ticking = false;
            });
        }
    }
    render() {
        return (
            <ScrollContainer innerRef={div => { this.scrollTarget = div; }}>
                {this.props.children}
            </ScrollContainer>
        );
    }
}

ScrollManager.propTypes = {
    children: PropTypes.any,
    managerId: PropTypes.string.isRequired
}

export default ScrollManager;
