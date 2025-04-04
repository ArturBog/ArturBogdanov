export const RenderPosition = {
    BEFOREBEGIN: 'beforebegin',
    AFTERBEGIN: 'afterbegin',
    BEFOREEND: 'beforeend',
    AFTEREND: 'afterend',
  };
  
  export const createElement = (template) => {
    const newElement = document.createElement('div');
    newElement.innerHTML = template;
  
    return newElement.firstElementChild;
  };
  
  export const render = (component, container, place = RenderPosition.BEFOREEND) => {
    const element = component.getElement();
  
    switch (place) {
      case RenderPosition.BEFOREBEGIN:
        container.before(element);
        break;
      case RenderPosition.AFTERBEGIN:
        container.prepend(element);
        break;
      case RenderPosition.BEFOREEND:
        container.append(element);
        break;
      case RenderPosition.AFTEREND:
        container.after(element);
        break;
    }
  };