/**
 * Sharp Cuts — Nigerian Barbershop Interactive Controller
 * Synchronizes service selection ("Book This Haircut"), smooth scrolling,
 * and appointment validation across the website.
 */
(function () {
  window.formatNaira = function (amount) {
    return '₦' + Number(amount).toLocaleString('en-NG');
  };

  window.triggerHaircutSelection = function (serviceName) {
    window.dispatchEvent(
      new CustomEvent('sharpcuts:select-service', {
        detail: { serviceName: serviceName },
      })
    );
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
})();
