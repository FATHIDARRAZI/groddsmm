export async function checkAdBlock(): Promise<boolean> {
  // If we are not in a browser environment, default to no adblock
  if (typeof window === 'undefined') return false;

  return new Promise((resolve) => {
    try {
      // Create an invisible element with common ad-related class names
      // Ad blockers usually inject CSS to hide elements with these classes
      const adElement = document.createElement('div');
      adElement.innerHTML = '&nbsp;';
      adElement.className = 'adsbox ad-placement doubleclick ad-placeholder sponsor-ad';
      adElement.style.position = 'absolute';
      adElement.style.top = '-9999px';
      adElement.style.left = '-9999px';
      document.body.appendChild(adElement);

      // Give the ad-blocker a short moment to apply its hiding CSS
      setTimeout(() => {
        try {
          // Check if the element was hidden by CSS (height === 0 or display === none)
          const isBlocked = 
            adElement.offsetHeight === 0 || 
            window.getComputedStyle(adElement).display === 'none';
          
          if (document.body.contains(adElement)) {
            document.body.removeChild(adElement);
          }
          resolve(isBlocked);
        } catch (err) {
          // If we fail to check, assume not blocked to be safe
          resolve(false);
        }
      }, 100);
    } catch (err) {
      resolve(false);
    }
  });
}
