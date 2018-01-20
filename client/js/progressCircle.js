export class ProgressCircle {

    constructor(parentElement) {
        this.outerRadius = "20";
        this.innerRadius = "14";
        this.center = "16";
        this.parentElement = parentElement;
    }

    create() {
        const namespace = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(namespace, "svg");
        const circle = document.createElementNS(namespace, "circle");
        const title = document.createElementNS(namespace, "text");


        circle.setAttribute("r", this.center);
        circle.setAttribute("cx", this.center);
        circle.setAttribute("cy", this.center);
        circle.setAttribute("stroke-dasharray", "0 100");
        circle.setAttribute("class", "progress");
        svg.setAttribute("viewBox", "-1 -1 33 33");
        svg.setAttribute("shape-rendering", "geometricPrecision");
        title.textContent = "";

        const innerCircle = document.createElementNS(namespace, "circle");
        innerCircle.setAttribute("r", this.innerRadius);
        innerCircle.setAttribute("cx", this.center);
        innerCircle.setAttribute("cy", this.center);
        innerCircle.setAttribute("fill", "#FFFFFF");

        const outerCircle = document.createElementNS(namespace, "circle");
        outerCircle.setAttribute("r", this.outerRadius);
        outerCircle.setAttribute("cx", this.center);
        outerCircle.setAttribute("cy", this.center);
        outerCircle.setAttribute("fill", "none");
        outerCircle.setAttribute("stroke", "#FFFFFF");
        outerCircle.setAttribute("stroke-width", "9px");

        svg.appendChild(circle);
        svg.appendChild(innerCircle);
        svg.appendChild(outerCircle);
        svg.appendChild(title);

        this.parentElement.innerHTML = "";
        this.parentElement.appendChild(svg);
    }


    isRendered() {
        return $(this.parentElement).find("circle").size() > 0;
    }

    updateProgress(percent, title) {
        const jqParent = $(this.parentElement);
        const circleElem = jqParent.find("circle.progress");
        const titleElem = jqParent.find("text");
        circleElem.attr("stroke-dasharray", parseInt(percent, 10) + " 100");
        circleElem.attr("class", "progress running");
        titleElem.text(title);
    }

    finished() {
        const jqParent = $(this.parentElement);
        const circleElem = jqParent.find("circle.progress");
        const titleElem = jqParent.find("text");
        circleElem.attr("class", "progress finished");
        circleElem.attr("stroke-dasharray", "0 100");
        titleElem.text("00:00");
    }

}