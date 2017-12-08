// ==UserScript==
// @name         otcbtc CNY => USD annotator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Convert CNY / BTC rate to USD / BTC rate using user input exchange rate
// @author       jasonsixc@gmail.com
// @match        https://otcbtc.com/*
// @grant        GM_addStyle
// @require http://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

(function() {
    'use strict';
    var rateTextBoxClassName = "cny-to-usd-excange-rate-input";
    var cssRules = "." + rateTextBoxClassName + " {width: 80vw;" +
        "box-sizing: border-box;" +
        "border-radius: 5px;" +
        "border: 1px solid gray;" +
        "padding: 5px;" +
        "position: fixed; " +
        "top: 70px; " +
        "z-index: 9999; " +
        "margin-bottom: 30px;}";

    GM_addStyle(cssRules);

    /**
     * Number.prototype.format(n, x)
     *
     * @param integer n: length of decimal
     * @param integer x: length of sections
     */
    Number.prototype.format = function(n, x) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
        return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
    };


    var container = document.querySelector("body");
    var rateTextBox = document.createElement("input");
    rateTextBox.setAttribute("placeholder", "CNY to USD Exchange Rate");
    rateTextBox.classList.add(rateTextBoxClassName);
    rateTextBox.addEventListener("keydown", function(event) {
        var sender = event.currentTarget;
        var rate = parseFloat(rateTextBox.value);
        setTimeout(() => {
            if (rate != "NaN") {
                updatePrice(rate);
            }
        }, 100);


    } );

    if(container) {
        container.insertBefore(rateTextBox, container.firstChild);
    }

    function getTextNode(element) {
        var priceText =  $(element)
        .clone()    //clone the element
        .children() //select all the children
        .remove()   //remove all the children
        .end()  //again go back to selected element
        .text()    //get the text of element
        .replace(",","");
        return priceText;
    }
    function updatePrice(rate) {
        var elements = document.querySelectorAll(".can-buy-count");
        var newCurrencyContainerClassName = "new-currency-container";
        var newPriceContainerClassName = "new-currency-price";

        elements.forEach(function(element) {

            var price = parseFloat(element.textContent.replace(",",""), 10);
            var newPrice =  (price * rate).format(2,3);
            var newPriceContainer = element.querySelector("."+newPriceContainerClassName);
            if(newPriceContainer) {
                newPriceContainer.textContent = newPrice + " ";
            } else {
                newPriceContainer = document.createElement("span");
                var newTextNode = document.createTextNode(newPrice + " ");
                newPriceContainer.classList.add(newPriceContainerClassName);
                newPriceContainer.appendChild(newTextNode);
                var unit = element.querySelector(".price-unit");
                var newUnit = unit.cloneNode();
                newUnit.textContent = unit.textContent.replace("CNY","USD");
                var myContainer = document.createElement("div");
                myContainer.classList.add(newCurrencyContainerClassName);
                myContainer.appendChild(newPriceContainer);
                myContainer.appendChild(newUnit);
                element.appendChild(myContainer);
            }
        });

        var otherElements = document.querySelectorAll("li.price");

        otherElements.forEach(function(element) {

            var priceText =  getTextNode(element);

            var price = parseFloat(priceText);
            var newPrice =  (price * rate).format(2,3);
            var newPriceContainer = element.querySelector("."+newPriceContainerClassName);
            if(newPriceContainer) {
                newPriceContainer.textContent = newPrice + " ";
            } else {
                newPriceContainer = document.createElement("span");
                newPriceContaine.classList.add(newPriceContainerClassName);
                var newTextNode = document.createTextNode(newPrice + " ");
                newPriceContaine.appendChild(newTextNode);
                var unit = element.querySelector(".second-line");
                var newUnit = unit.cloneNode();
                newUnit.textContent = unit.textContent.replace("CNY","USD");
                var myContainer = document.createElement("div");
                myContainer.classList.add(newCurrencyContainerClassName);
                myContainer.appendChild(newPriceContainer);
                myContainer.appendChild(newUnit);
                element.appendChild(myContainer);
            }
        });

        var paymentElemet = document.querySelector(".price-info .make-offers");
        if (paymentElemet) {
            var oringalPrice = 0;
            var priceText =  $(".make-offers").text().replace(/[^0-9.]/g,"");
            if (oringalPrice === 0) {
                oringalPrice =  parseFloat(priceText);
            }
            var newPrice = (oringalPrice * rate).format(2, 3);
            var newPriceContainer = paymentElemet.querySelector("."+newPriceContainerClassName);
            if(newPriceContainer) {
                newPriceContainer.textContent = newPrice + " USD / BTC";
            } else {
                newPriceContainer = document.createElement("span");
                var newPriceTextNode = document.createTextNode(newPrice);
                newPriceContainer.classList.add(newPriceContainerClassName);
                var newTextNode = document.createTextNode(newPrice + " USD / BTC");
                newPriceContainer.appendChild(newTextNode);
                var myContainer = document.createElement("div");
                myContainer.classList.add(newCurrencyContainerClassName);
                myContainer.appendChild(newPriceContainer);
                paymentElemet.appendChild(myContainer);
            }
        }

        var currentRate = document.querySelector(".current-rate span.price");
        var currentRateUsdContainerClassName = "user-script-price-usd";
        var currentRateUsdContainer;
        if (currentRate) {
            var currentRateCny = currentRate.innerText.replace(/[^0-9.]/g,"");

            var currentRateUsd = (parseFloat(currentRateCny) * rate).format(2, 3);
            currentRateUsdContainer = document.querySelector("." + currentRateUsdContainerClassName);
            if (currentRateUsdContainer) {
                currentRateUsdContainer.textContent = currentRateUsd + " USD";
            } else {
                currentRateUsdContainer = document.createElement("div");
                currentRateUsdContainer.classList.add(currentRateUsdContainerClassName, "price");
                currentRateUsdContainer.textContent = currentRateUsd + " USD";
                currentRate.parentNode.insertBefore(currentRateUsdContainer, currentRate);
            }
        }
    }
})();