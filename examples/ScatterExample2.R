require(Biobase)
require(RColorBrewer)
require(d3Toolbox)

ui <- navbarPage(title = "navbarPageExample",
    tabPanel(title = "Example",
        fluidRow(
            column(8,
                d3ScatterOutput("tSNE_panel", width = "100%", height = 600),
                actionButton('change','Change data')
            ),
            column(4,
                h3(verbatimTextOutput("currentOutput")),
                d3BarplotOutput("filterpanel", width = "100%", height = 300),
                d3ScatterOutput("lowdimpanel", width = "100%", height = 300)#,
                #tags$head(tags$script(src="D3Scatter.js"))
            )
        )
    )
)

server <- function(input, output, session) {

    values <- reactiveValues(data = iris)

    #multidim panel
    output$tSNE_panel <- renderd3Scatter({
        val <- values$data
        data <- data.frame(x=val$Sepal.Length,
                           y=val$Sepal.Width,
                           z=val$Petal.Length,
                           Species=val$Species)

        legend <- data.frame(col=c('steelblue','orange','black'),
                             name=levels(val$Species))
        d3Scatter(data,
                  col=c('steelblue','orange','black')[as.numeric(val$Species)],
                  dotsize = 6,
                  xlab='Sepal Length',
                  ylab='Sepal Width',
#                  xrange=c(4,9),
#                  yrange=c(1,5),
                  title='Iris dataset',
                  subtitle='subtitle',
                  tooltip = c('Species','z'),
                  legend = legend,
                  callback_handler='ScatterSelection')
    })

    observeEvent(input$change,{
        values$data <- values$data[-3,]
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
                  callback_handler='ScatterSelection')
    })

    output$currentOutput <- renderPrint({ print(input$ScatterSelection) })

}

shinyApp(ui, server)
