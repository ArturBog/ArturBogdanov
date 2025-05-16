export const RenderPosition = {
  BEFOREBEGIN: 'beforebegin',
  AFTERBEGIN: 'afterbegin',
  BEFOREEND: 'beforeend',
  AFTEREND: 'afterend'
};

export const createElement = (template) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = template.trim();
  return wrapper.firstChild;
};

export const render = (component, container, position = 'beforeend') => {
  container.insertAdjacentElement(position, component.element);
};