#' Scatterplot based on D3
#'
#'
#'
#' @import htmlwidgets
#'
#' @export
d3Scatter <- function(data, col='black', dotsize =3.5, xlab='', ylab='',
                      title=NULL, subtitle=NULL, callback_handler='ScatterSelection',
                      tooltip=NULL, legend=NULL ,width = NULL, height = NULL,
                      xrange=NULL, yrange=NULL,
                      col_scale = RColorBrewer::brewer.pal(11,"RdBu")[11:1],
                      elementId = NULL) {

    #if a numeric value was provided use the color scale to transform
    if (is.numeric(col)){
        if (length(col) != nrow(data)){
            stop('If "col" is numeric there has to be a value for each data row')
        }
        breaks <- seq(min(col, na.rm = T),
                      max(col, na.rm = T),
                      length = length(col_scale) + 1 )
        grps <- cut(col, breaks = breaks, include.lowest = TRUE)
        col <- col_scale[grps]
    }else{
        #Fix the coloring
        col <- gplots::col2hex(col)

        if(length(col)==1){
            col <- rep(col,nrow(data))
        }
    }
    data$col <- col

    if (!is.null(xrange) && length(xrange) != 2){
        stop("If xrange is specified it needs to have a length of 2")
    }

    if (!is.null(yrange) && length(yrange) != 2){
        stop("If yrange is specified it needs to have a length of 2")
    }

    #Add names as separate column instead of rownames
    data$name <- rownames(data)
    rownames(data) <- NULL

    #fix the labels
    if (xlab==''){
        xlab <- names(data)[1]
    }

    if (ylab==''){
        ylab <- names(data)[2]
    }
    names(data)[1:2] <- c('x','y')

    # forward options using x
    x = list(
        data = data,
        dotsize = dotsize,
        xlab = xlab,
        ylab = ylab,
        xrange = xrange,
        yrange = yrange,
        title = title,
        subtitle = subtitle,
        tooltip=tooltip,
        legend=legend,
        callback_handler = callback_handler
    )

  # create widget
  htmlwidgets::createWidget(
    name = 'd3Scatter',
    x,
    width = width,
    height = height,
    package = 'd3Toolbox',
    elementId = elementId,
    sizingPolicy = htmlwidgets::sizingPolicy(browser.fill = TRUE)
  )
}

#' Shiny bindings for D3Scatter
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
#' @name d3Scatter-shiny
#'
#' @export
d3ScatterOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'd3Scatter', width, height, package = 'd3Toolbox')
}

#' @rdname d3Scatter-shiny
#' @export
renderd3Scatter <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, d3ScatterOutput, env, quoted = TRUE)
}
