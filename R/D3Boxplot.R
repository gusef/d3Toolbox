#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
d3Boxplot <- function(data, col='lightgrey', showdots =TRUE, dotcol='darkgrey',
                      dotsize =2, xlab='', ylab='', title=NULL, subtitle=NULL, margins = NULL,
                      callback='BoxplotSelection', legend=NULL,
                      width = NULL, height = NULL, elementId = NULL, collection = FALSE) {

    if (is.null(margins)){
        margins <- list(top = 40,
                        right = 20,
                        bottom = 50,
                        left = 60)
    }

    #check if the data is a single vector
    if (class(data) == "numeric"){
        data <- list(x=data)
    }

    #Fix the coloring
    col <- gplots::col2hex(col)
    dotcol <- col2hex(dotcol)
    if(length(col)==1){
        col <- rep(col,length(data))
    }else if(length(col) != length(data)){
        stop('Length of color vector does not equal number of boxes')
    }

    #extract the stats for the actual boxplots
    stats <- boxplot(data, plot = F)$stats
    colnames(stats) <- names(data)
    rownames(stats) <- c('min','qt1','median','qt3','max')

    #get the plot range in R since it's easier to calculate
    smin <- sapply(data,min)
    smax <- sapply(data,max)
    srange <- smax-smin
    range <- c(min(smin - (srange * .05)),
               max(smax + (srange * .05)))

    #get the outliers
    outliers <- lapply(names(data),
                       function(x,st,da)data[[x]][!(!data[[x]]<stats['min',x] &
                                                       !data[[x]]>stats['max',x])],
                       stats,data)
    names(outliers) <- names(data)

    #reshape the data so it is easier to handle in javascript
    reshapeR <- function(dat){
        dat <- lapply(names(dat),function(x,y)cbind(y[[x]],x),dat)
        dat <- data.frame(do.call("rbind", dat),stringsAsFactors = F)
        names(dat) <- c('x','name')
        dat$x <- as.numeric(dat$x)
        return(dat)
    }

    data_long <- reshapeR(data)
    outliers <- outliers[sapply(outliers,length)>0]
    if (length(outliers)==0){
        outliers_long <- NULL
    }else{
        outliers_long <- reshapeR(outliers)
    }

    # forward options using x
    x = list(
        type = "d3Boxplot",
        data = data_long,
        stats = stats,
        outliers = outliers_long,
        names = names(data),
        range = range,
        col = col,
        showdots = showdots,
        dotcol = dotcol,
        dotsize = dotsize,
        xlab = xlab,
        ylab = ylab,
        title = title,
        subtitle = subtitle,
        legend = legend,
        margins = margins,
        callback = callback
    )

    if (collection){
        return(x)
    }else{
        # create widget
        htmlwidgets::createWidget(
            name = 'd3Boxplot',
            x,
            width = width,
            height = height,
            package = 'd3Toolbox',
            elementId = elementId,
            sizingPolicy = htmlwidgets::sizingPolicy(browser.fill = TRUE)
        )
    }
}

#' Shiny bindings for D3Boxplot
#'
#' Output and render functions for using D3Boxplot within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a D3Boxplot
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name d3Boxplot-shiny
#'
#' @export
d3BoxplotOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'd3Boxplot', width, height, package = 'd3Toolbox')
}

#' @rdname d3Boxplot-shiny
#' @export
renderd3Boxplot <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, d3BoxplotOutput, env, quoted = TRUE)
}
