#' Heatmap image based on d3
#'
#'
#'
#' @import htmlwidgets
#'
#' @export
d3Image <- function(data, xlab = rownames(data), ylab = colnames(data), 
                    raw_values = NULL, show_xlabs = !is.null(colnames(data)),
                    show_ylabs = !is.null(rownames(data)),
                    allow_NA = FALSE, lab_font_size = 12,
                    xlab_text = NULL, ylab_text = NULL,
                    title = NULL, subtitle = NULL, callback='ImageSelection',
                    width = NULL, height = NULL, margins = NULL,
                    col_scale = RColorBrewer::brewer.pal(11,"RdBu")[11:1],
                    elementId = NULL, collection = FALSE) {

    if (is.null(margins)){
        margins <- list(top = 40,
                        right = 20,
                        bottom = 50,
                        left = 60)
    }

    if (!is.null(raw_values)){
        if (!all(dim(raw_values) == dim(data))){
            stop("The raw_values matrix needs to have the same dimensions as the matrix")
        }
    }

    if (!allow_NA && sum(is.na(data)) >0){
        stop('NA values detected, please set allow_NA=TRUE')
    }

    if (class(as.vector(data)) == 'numeric'){
        col_scale <- gplots::col2hex(col_scale)
        breaks <- seq(min(data, na.rm = T),
                      max(data, na.rm = T),
                      length = length(col_scale) + 1 )

        grps <- cut(data, breaks = breaks, include.lowest = TRUE)
        col <- col_scale[grps]
        col <- matrix(col, ncol=ncol(data))

        #if we have a numeric matrix and no raw values specified use the matrix values
        if (is.null(raw_values)){
            raw_values <- data
        }
    } else {
        col <- matrix(gplots::col2hex(data), ncol=ncol(data))
    }

    #specify x labels
    if (is.null(colnames(data))){
        xax <- 1:ncol(data)
    } else {
        xax <- colnames(data)
    }

    #specify x labels
    if (is.null(rownames(data))){
        yax <- 1:nrow(data)
    } else {
        yax <- rownames(data)
    }

    # forward options using x
    x = list(
        type = "d3Image",
        data = col,
        raw_values = raw_values,
        xlab = xlab,
        ylab = ylab,
        xax = xax,
        yax = yax,
        show_xax = show_xlabs,
        show_yax = show_ylabs,
        xlab_text = xlab_text,
        ylab_text = ylab_text,
        lab_font_size = lab_font_size,
        title = title,
        subtitle = subtitle,
        margins=margins,
        callback = callback
    )

    if (collection){
        return(x)
    }else{
        # create widget
        htmlwidgets::createWidget(
            name = 'd3Image',
            x,
            width = width,
            height = height,
            package = 'd3Toolbox',
            elementId = elementId,
            sizingPolicy = htmlwidgets::sizingPolicy(browser.fill = TRUE)
        )
    }
}

#' Shiny bindings for d3Image
#'
#' Output and render functions for using D3Scatter within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a D3Scatter
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name d3Image-shiny
#'
#' @export
d3ImageOutput <- function(outputId, width = '100%', height = '400px'){
    htmlwidgets::shinyWidgetOutput(outputId, 'd3Image', width, height, package = 'd3Toolbox')
}

#' @rdname d3Image-shiny
#' @export
renderd3Image <- function(expr, env = parent.frame(), quoted = FALSE) {
    if (!quoted) { expr <- substitute(expr) } # force quoted
    htmlwidgets::shinyRenderWidget(expr, d3ImageOutput, env, quoted = TRUE)
}
