/**
 * @class Ext.Carousel
 * @extends Ext.Panel
 *
 * <p>A customized Panel which provides the ability to slide back and forth between
 * different child items.</p>
 * 
 * <h2>Useful Properties</h2>
 * <ul class="list">
 *   <li>{@link #ui} (defines the style of the carousel)</li>
 *   <li>{@link #direction} (defines the direction of the carousel)</li>
 *   <li>{@link #indicator} (defines if the indicator show be shown)</li>
 * </ul>
 * 
 * <h2>Useful Methods</h2>
 * <ul class="list">
 *   <li>{@link #next} (moves to the next card)</li>
 *   <li>{@link #prev} (moves to the previous card)</li>
 *   <li>{@link #setActiveItem} (moves to the passed card)</li>
 * </ul>
 * 
 * <h2>Screenshot:</h2>
 *
 * {@img Ext.Carousel/screenshot.png Ext.Carousel screenshot}
 * 
 * <h2>Example code:</h2>
<pre><code>
var carousel = new Ext.Carousel({
    items: [
        {
            html: '&lt;p&gt;Navigate the carousel on this page by swiping left/right.&lt;/p&gt;',
            cls : 'card card1'
        },
        {
            html: '&lt;p&gt;Clicking on either side of the indicators below&lt;/p&gt;',
            cls : 'card card2'
        },
        {
            html: 'Card #3',
            cls : 'card card3'
        }
    ]
});

var panel = new Ext.Panel({
    cls: 'cards',
    layout: {
        type : 'vbox',
        align: 'stretch'
    },
    defaults: {
        flex: 1
    },
    items: [
        carousel,
        {
            xtype    : 'carousel',
            ui       : 'light',
            direction: 'vertical',
            
            items: [
            {
                    html: '&lt;p&gt;Carousels can be vertical and given a ui of "light" or "dark".&lt;/p&gt;',
                    cls : 'card card1'
                },
                {
                    html: 'Card #2',
                    cls : 'card card2'
                },
                {
                    html: 'Card #3',
                    cls : 'card card3'
                }
            ]
        }
    ]
});
</code></pre>
 * @xtype carousel
 */
Ext.Carousel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String} baseCls
     * The base CSS class to apply to the Carousel's element (defaults to <code>'x-carousel'</code>).
     */
    baseCls: 'x-carousel',

    /**
     * @cfg {Boolean} indicator
     * Provides an indicator while toggling between child items to let the user
     * know where they are in the card stack.
     */
    indicator: true,

    /**
     * @cfg {String} ui
     * Style options for Carousel. Default is 'dark'. 'light' is also available.
     */
    ui: 'dark',

    /**
     * @cfg {String} direction
     * The direction of the Carousel. Default is 'horizontal'. 'vertical' also available.
     */
    direction: 'horizontal',

    // @private
    horizontal: false,
    // @private
    vertical: false,
    
    // @private
    initComponent: function() {
        this.layout = {
            type: 'card',
            // This will set the size of all cards in this container on each layout
            sizeAllCards: true,
            // This will prevent the hiding of items on card switch
            hideInactive: false,
            itemCls: 'x-carousel-item',
            targetCls: 'x-carousel-body',
            setOwner : function(owner) {
                Ext.layout.CardLayout.superclass.setOwner.call(this, owner);
            }
        };
         
        if (this.indicator) {
            var cfg = Ext.isObject(this.indicator) ? this.indicator : {};
            this.indicator = new Ext.Carousel.Indicator(Ext.apply({}, cfg, {
                direction: this.direction,
                carousel: this,
                ui: this.ui
            }));
        }

        if (this.direction == 'horizontal') {
            this.horizontal = true;
        }
        else {
            this.vertical = true;
        }
        
        Ext.Carousel.superclass.initComponent.call(this);
    },

    // @private
    afterRender: function() {
        Ext.Carousel.superclass.afterRender.call(this);

        // Bind the required listeners
        this.mon(this.body, {
            drag: this.onDrag,
            dragThreshold: 5,
            dragend: this.onDragEnd,
            direction: this.direction,
            scope: this
        });
        
        this.el.addCls(this.baseCls + '-' + this.direction);
    },
    
    // private, inherit docs
    onAdd: function(){
        Ext.Carousel.superclass.onAdd.apply(this, arguments);
        var indicator = this.indicator;
        if (indicator) {
            indicator.onCardAdd();
        }    
    },
    
    // private, inherit docs
    onRemove: function(){
        Ext.Carousel.superclass.onRemove.apply(this, arguments);
        var indicator = this.indicator;
        if (indicator) {
            indicator.onCardRemove();
        }
    },
    
    /**
     * The afterLayout method on the carousel just makes sure the active card
     * is still into view. It also makes sure the indicator is pointing to
     * the right card.
     * @private
     */    
    afterLayout : function() {
        Ext.Carousel.superclass.afterLayout.apply(this, arguments);
        
        this.currentSize = this.body.getSize();
        this.currentScroll = {x: 0, y: 0};
        
        this.updateCardPositions();
        
        var activeItem = this.layout.getActiveItem();        
        if (activeItem && this.indicator) {  
            this.indicator.onBeforeCardSwitch(this, activeItem, null, this.items.indexOf(activeItem));
        }
    },

    /**
     * The onDrag method sets the currentScroll object. It also slows down the drag
     * if we are at the bounds of the carousel.
     * @private
     */    
    onDrag : function(e) {
        this.currentScroll = {
            x: e.deltaX,
            y: e.deltaY
        };
        
        // Slow the drag down in the bounce
        var activeIndex = this.items.items.indexOf(this.layout.activeItem);
        // If this is a horizontal carousel    
        if (this.horizontal) {
            if (
                // And we are on the first card and dragging left
                (activeIndex == 0 && e.deltaX > 0) || 
                // Or on the last card and dragging right
                (activeIndex == this.items.length - 1 && e.deltaX < 0)
            ) {
                // Then slow the drag down
                this.currentScroll.x = e.deltaX / 2;             
            }
        }
        // If this is a vertical carousel
        else if (this.vertical) {
            if (
                // And we are on the first card and dragging up
                (activeIndex == 0 && e.deltaY > 0) || 
                // Or on the last card and dragging down
                (activeIndex == this.items.length - 1 && e.deltaY < 0)
            ) {
                // Then slow the drag down
                this.currentScroll.y = e.deltaY / 2;
            }
        }
        // This will update all the cards to their correct position based on the current drag
        this.updateCardPositions();
    },

    /**
     * This will update all the cards to their correct position based on the current drag.
     * It can be passed true to animate the position updates.
     * @private
     */
    updateCardPositions : function(animate) {
        var cards = this.items.items,
            ln = cards.length,
            cardOffset,
            i, card, el, style;
        
        // Now we loop over the items and position the active item
        // in the middle of the strip, and the two items on either
        // side to the left and right.
        for (i = 0; i < ln; i++) {
            card = cards[i];  
            
            // This means the items is within 2 cards of the active item
            if (this.isCardInRange(card)) {
                if (card.hidden) {
                    card.show();
                }
                
                el = card.el;
                style = el.dom.style;
                
                if (animate) {
                    if (card === this.layout.activeItem) {
                        el.on('webkitTransitionEnd', this.onTransitionEnd, this, {single: true});
                    }
                    style.webkitTransitionDuration = '300ms';
                }
                else {
                    style.webkitTransitionDuration = '0ms';
                }

                cardOffset = this.getCardOffset(card);
                if (this.horizontal) {
                    Ext.Element.cssTransform(el, {translate: [cardOffset, 0]});
                }
                else {
                    Ext.Element.cssTransform(el, {translate: [0, cardOffset]});
                }
            }
            else if (!card.hidden) {
                // All other items we position far away
                card.hide();
            }
        }
    },

    /**
     * Returns the amount of pixels from the current drag to a card.
     * @private
     */    
    getCardOffset : function(card) {
        var cardOffset = this.getCardIndexOffset(card),
            currentSize = this.currentSize,
            currentScroll = this.currentScroll;
            
        return this.horizontal ?
            (cardOffset * currentSize.width) + currentScroll.x :
            (cardOffset * currentSize.height) + currentScroll.y;
    },

    /**
     * Returns the difference between the index of the active card and the passed card.
     * @private
     */        
    getCardIndexOffset : function(card) {
        return this.items.items.indexOf(card) - this.getActiveIndex();
    },

    /**
     * Returns true if the passed card is within 2 cards from the active card.
     * @private
     */    
    isCardInRange : function(card) {
        return Math.abs(this.getCardIndexOffset(card)) <= 2;
    },

    /**
     * Returns the index of the currently active card.
     * @return {Number} The index of the currently active card.
     */    
    getActiveIndex : function() {
        return this.items.indexOf(this.layout.activeItem);
    },

    /**
     * This determines if we are going to the next card, the previous card, or back to the active card.
     * @private
     */        
    onDragEnd : function(e, t) {
        var previousDelta, deltaOffset; 
            
        if (this.horizontal) {
            deltaOffset = e.deltaX;
            previousDelta = e.previousDeltaX;
        }
        else {
            deltaOffset = e.deltaY;
            previousDelta = e.previousDeltaY;
        }
            
        // We have gone to the right
        if (deltaOffset < 0 && Math.abs(deltaOffset) > 3 && previousDelta <= 0 && this.layout.getNext()) {
            this.next();
        }
        // We have gone to the left
        else if (deltaOffset > 0 && Math.abs(deltaOffset) > 3 && previousDelta >= 0 && this.layout.getPrev()) {
            this.prev();
        }
        else {
            // drag back to current active card
            this.scrollToCard(this.layout.activeItem);
        }
    },

    /**
     * Here we make sure that the card we are switching to is not translated
     * by the carousel anymore. This is only if we are switching card using
     * the setActiveItem of setActiveItem methods and thus customDrag is not set
     * to true.
     * @private
     */
    onBeforeCardSwitch : function(newCard) {
        if (!this.customDrag && this.items.indexOf(newCard) != -1) {
            var style = newCard.el.dom.style;
            style.webkitTransitionDuration = null;
            style.webkitTransform = null;
        }
        return Ext.Carousel.superclass.onBeforeCardSwitch.apply(this, arguments);
    },

    /**
     * This is an internal function that is called in onDragEnd that goes to
     * the next or previous card.
     * @private
     */    
    scrollToCard : function(newCard) {
        this.currentScroll = {x: 0, y: 0};
        this.oldCard = this.layout.activeItem;
        
        if (newCard != this.oldCard && this.isCardInRange(newCard) && this.onBeforeCardSwitch(newCard, this.oldCard, this.items.indexOf(newCard), true) !== false) {
            this.layout.activeItem = newCard;
            if (this.horizontal) {
                this.currentScroll.x = -this.getCardOffset(newCard);
            }
            else {
                this.currentScroll.y = -this.getCardOffset(newCard);
            }
        }
        
        this.updateCardPositions(true);
    },    

    // @private
    onTransitionEnd : function(e, t) {
        this.customDrag = false;
        this.currentScroll = {x: 0, y: 0};
        if (this.oldCard && this.layout.activeItem != this.oldCard) {
            this.onCardSwitch(this.layout.activeItem, this.oldCard, this.items.indexOf(this.layout.activeItem), true);
        }
        delete this.oldCard;
    },
        
    /**
     * This function makes sure that all the cards are in correct locations
     * after a card switch
     * @private
     */
    onCardSwitch : function(newCard, oldCard, index, animated) {
        this.currentScroll = {x: 0, y: 0};
        this.updateCardPositions();
        Ext.Carousel.superclass.onCardSwitch.apply(this, arguments);
        newCard.fireEvent('activate', newCard);
    },

    /**
     * Switches the next card
     */
    next: function() {
        var next = this.layout.getNext();
        if (next) {
            this.customDrag = true;
            this.scrollToCard(next);
        }
        return this;
    },

    /**
     * Switches the previous card
     */
    prev: function() {
        var prev = this.layout.getPrev();
        if (prev) {
            this.customDrag = true;
            this.scrollToCard(prev);
        }
        return this;
    },
    
    /**
     * Method to determine whether this Sortable is currently disabled.
     * @return {Boolean} the disabled state of this Sortable.
     */
    isVertical : function() {
        return this.vertical;
    },
    
    /**
     * Method to determine whether this Sortable is currently sorting.
     * @return {Boolean} the sorting state of this Sortable.
     */
    isHorizontal : function() {
        return this.horizontal;
    },
    
    // private, inherit docs
    beforeDestroy: function(){
        Ext.destroy(this.indicator);
        Ext.Carousel.superclass.beforeDestroy.call(this);
    }
});

Ext.reg('carousel', Ext.Carousel);

/**
 * @class Ext.Carousel.Indicator
 * @extends Ext.Component
 * @xtype carouselindicator
 * @private
 *
 * A private utility class used by Ext.Carousel to create indicators.
 */
Ext.Carousel.Indicator = Ext.extend(Ext.Component, {
    baseCls: 'x-carousel-indicator',

    initComponent: function() {
        if (this.carousel.rendered) {
            this.render(this.carousel.body);
            this.onBeforeCardSwitch(null, null, this.carousel.items.indexOf(this.carousel.layout.getActiveItem()));
        }
        else {
            this.carousel.on('render', function() {
                this.render(this.carousel.body);
            }, this, {single: true});
        }
        Ext.Carousel.Indicator.superclass.initComponent.call(this);
    },

    // @private
    onRender: function() {
        Ext.Carousel.Indicator.superclass.onRender.apply(this, arguments);

        for (var i = 0, ln = this.carousel.items.length; i < ln; i++) {
            this.createIndicator();
        }

        this.mon(this.carousel, {
            beforecardswitch: this.onBeforeCardSwitch,
            scope: this
        });

        this.mon(this.el, {
            tap: this.onTap,
            scope: this
        });
        
        this.el.addCls(this.baseCls + '-' + this.direction);
    },

    // @private
    onTap: function(e, t) {
        var box = this.el.getPageBox(),
            centerX = box.left + (box.width / 2),
            centerY = box.top + (box.height / 2),
            carousel = this.carousel;

        if ((carousel.isHorizontal() && e.pageX > centerX) || (carousel.isVertical() && e.pageY > centerY)) {
            this.carousel.next();
        } else {
            this.carousel.prev();
        }
    },

    // @private
    createIndicator: function() {
        this.indicators = this.indicators || [];
        this.indicators.push(this.el.createChild({
            tag: 'span'
        }));
    },

    // @private
    onBeforeCardSwitch: function(carousel, card, old, index) {
        if (Ext.isNumber(index) && index != -1 && this.indicators[index]) {
            this.indicators[index].radioCls('x-carousel-indicator-active');
        }
    },

    // @private
    onCardAdd: function() {
        if (this.rendered) {
            this.createIndicator();
        }
    },

    // @private
    onCardRemove: function() {
        if (this.rendered) {
            this.indicators.pop().remove();
        }
    }
});

Ext.reg('carouselindicator', Ext.Carousel.Indicator);