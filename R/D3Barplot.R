#' D3Barplot
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
d3Barplot <- function(data, se = NULL,
                      col='black', beside=FALSE, tooltip=NULL, las = 1,
                      unit='', xlab='', ylab='', padding=0.1, legend=NULL,
                      show_axes = TRUE, title=NULL, title_size=24, subtitle=NULL,
                      callback='BarSelection', yrange=NULL,
                      margins = NULL, width = NULL, height = NULL,
                      elementId = NULL, collection = FALSE) {

    if (is.null(margins)){
        margins <- list(top = 40,
                        right = 20,
                        bottom = 50,
                        left = 60)
    }

    if (!is.null(yrange) && length(yrange) != 2){
        stop("If yrange is specified it needs to have a length of 2")
    }

    #Fix the coloring
    col <- gplots::col2hex(col)

    #if we have only one variable
    if (is.null(dim(data))){
        singleVar = TRUE
        data <- data.frame(x=data)
        #fix the coloring
        if(length(col)==1){
            col <- rep(col,nrow(data))
        }
        #if there is a standard error specified
        if (!is.null(se)){
            if (length(se) != nrow(data)){
                stop('If standard error is specified there nees to be a SE value for each bar')
            }
            data$SE <- se
        }
    #grouped / stacked barplot
    }else{
        singleVar = FALSE
        data <- data.frame(data,stringsAsFactors = F)
        if(length(col)!=ncol(data)){
            stop('Need to specify one color for each variable')
        }
        #if there is a standard error specified
        if (!is.null(se)){
            if (all(dim(se) != dim(data))){
                stop('If standard error is specified there nees to be a SE value for each bar')
            }
            if (!is.null(colnames(se)) && colnames(se) != colnames(data)){
                stop('If column names on SE are specified, they need to match the data names')
            }
            colnames(se) <- paste0('SE_',colnames(data))
            data <- cbind(data,se)
        }
    }

    #get max value
    if (beside){
        max_value <- max(data)
    } else {
        max_value <- max(rowSums(data))
    }

    #separate names and data
    data$name <- rownames(data)
    rownames(data) <- NULL


    if (!is.null(tooltip)){
        data$tooltip <- tooltip;
    }

    # forward options using x
    x = list(
        type = "d3Barplot",
        data = data,
        SE = !is.null(se),
        fill = col,
        unit = unit,
        xlab = xlab,
        ylab = ylab,
        las = las,
        singleVar = singleVar,
        beside = beside,
        show_axes = show_axes,
        yrange = yrange,
        padding = padding,
        title = title,
        title_size = paste0(title_size,'px'),
        legend = legend,
        max_value = max_value,
        subtitle = subtitle,
        margins=margins,
        callback = callback
    )

    if (collection){
        return(x)
    }else{
        # create widget
        htmlwidgets::createWidget(
            name = 'd3Barplot',
            x,
            width = width,
            height = height,
            package = 'd3Toolbox',
            elementId = elementId,
            sizingPolicy = htmlwidgets::sizingPolicy(browser.fill = TRUE)
         )
    }
}

#' Shiny bindings for D3Barplot
#'
#' Output and render functions for using D3Barplot within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a D3Barplot
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name d3Barplot-shiny
#'
#' @export
d3BarplotOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'd3Barplot', width, height, package = 'd3Toolbox')
}

#' @rdname d3Barplot-shiny
#' @export
renderd3Barplot <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, d3BarplotOutput, env, quoted = TRUE)
}
