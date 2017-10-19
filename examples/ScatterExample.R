require(Biobase)
require(RColorBrewer)
require(d3Toolbox)

ui <- fillPage(fillRow(
  #multi-panel
  d3ScatterOutput("tSNE_panel", width = "100%", height = "100%"),
  fillCol(
    h3(verbatimTextOutput("currentOutput")),
    d3BarplotOutput("filterpanel", width = "100%", height = "100%"),
    d3ScatterOutput("lowdimpanel", width = "100%", height = "100%")
  ),flex = c(2,1))
  ,tags$head(tags$script(src="d3-toolbox.js"))
)

server <- function(input, output, session) {
    #multidim panel
    output$tSNE_panel <- renderd3Scatter({
        data <- data.frame(x=iris$Sepal.Length,
                           y=iris$Sepal.Width,
                           z=iris$Petal.Length,
                           Species=iris$Species)

        legend <- data.frame(col=c('steelblue','orange','black'),
                             name=levels(iris$Species))
        d3Scatter(data,
                  col=c('steelblue','orange','black')[as.numeric(iris$Species)],
                  dotsize = 6,
                  xlab='Sepal Length',
                  ylab='Sepal Width',
#                  xrange=c(4,9),
#                  yrange=c(1,5),
                  title='Iris dataset',
                  subtitle='subtitle',
                  tooltip = c('Species','z'),
                  legend = legend,
                  legend_title = 'Iris types',
                  legend_pos = 'topleft',
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

    output$lowdimpanel <- renderd3Scatter({
        data <- data.frame(x=iris$Sepal.Length,
                           y=iris$Sepal.Width,
                           z=iris$Petal.Length,
                           Species=iris$Species)
        d3Scatter(data,
                  col=iris$Petal.Length,
                  dotsize = 3,
                  xlab='Sepal Length',
                  ylab='Sepal Width',
                  title='Iris dataset',
                  subtitle='subtitle',
                  tooltip = c('Species'),
                  callback='ScatterSelection')
    })

    output$currentOutput <- renderPrint({ print(input$ScatterSelection) })

}

shinyApp(ui, server)
