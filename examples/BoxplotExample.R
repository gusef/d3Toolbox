require(Biobase)
require(RColorBrewer)
require(d3Toolbox)


ui <- fillPage(fillRow(
  #multi-panel
    d3BoxplotOutput("tSNE_panel", width = "100%", height = "100%"),
  fillCol(
    h3(verbatimTextOutput("currentOutput")),
    d3BarplotOutput("filterpanel", width = "100%", height = "100%"),
    d3ScatterOutput("lowdimpanel", width = "100%", height = "100%")
  ),flex = c(2,1))
  #,tags$head(tags$script(src="D3Boxplot.js"))
)

server <- function(input, output, session) {
    #multidim panel
    output$lowdimpanel <- renderd3Scatter({
        data <- data.frame(x=iris$Sepal.Length,
                           y=iris$Sepal.Width,
                           z=iris$Petal.Length,
                           Species=iris$Species)
        rownames(data) <- paste0('Ex1_',1:nrow(data))

        legend <- data.frame(col=c('steelblue','orange','grey'),
                             name=levels(iris$Species))

        d3Scatter(data,
                  col=c('steelblue','orange','grey')[as.numeric(iris$Species)],
                  dotsize = 6,
                  xlab='Sepal Length',
                  ylab='Sepal Width',
                  title='Iris dataset',
                  subtitle='subtitle',
                  tooltip = c('Species','z'),
                  #legend = legend,
                  callback='ScatterSelection')
    })

    output$filterpanel <- renderd3Barplot({
        data <- data.frame(x=(1:15),
                           y=(1:15)/2,
                           z=15:1)
        rownames(data) <- c(LETTERS[1:15])

        d3Barplot(data,
                  col=c('steelblue','grey','#de2d26'),
                  tooltip=c(paste0('letter_',LETTERS[1:15])),
                  xlab='Letters',
                  ylab='Frequencies',
                  title='New Barplot',
                  subtitle='with subtitle')
    })

    output$tSNE_panel <- renderd3Boxplot({
        data <- lapply(levels(iris$Species),
                       function(x,y)y[y$Species==x,'Sepal.Length'],
                       iris)
        names(data) <- levels(iris$Species)
        d3Boxplot(data,
                  col=c('steelblue','orange','grey'),
                  dotsize = 3,
                #  showdots = F,
                  xlab='Sepal Length',
                  ylab='Sepal Width',
                  title='Iris dataset',
                  subtitle='subtitle',
                  callback='ScatterSelection')
    })

    output$currentOutput <- renderPrint({ print(input$ScatterSelection) })

}

shinyApp(ui, server)
