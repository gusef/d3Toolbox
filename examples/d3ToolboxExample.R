require(Biobase)
require(RColorBrewer)
require(d3Toolbox)


ui <- fillPage(fillRow(
  #multi-panel
  d3ToolboxOutput("tSNE_panel", width = "100%", height = "100%"),
  fillCol(
    h3(verbatimTextOutput("currentOutput")),
    D3BarplotOutput("filterpanel", width = "100%", height = "100%"),
    D3ScatterOutput("lowdimpanel", width = "100%", height = "100%")
  ),flex = c(2,1))#,
  #tags$head(tags$script(src="D3Scatter.js"))
)

server <- function(input, output, session) {
    #multidim panel
    output$tSNE_panel <- renderD3Toolbox({
        data <- data.frame(x=iris$Sepal.Length,
                           y=iris$Sepal.Width,
                           z=iris$Petal.Length,
                           Species=iris$Species)

        legend <- data.frame(col=c('steelblue','orange','black'),
                             name=levels(iris$Species))
        d3Toolbox('test')
    })

    output$filterpanel <- renderD3Barplot({
        data <- data.frame(x=(1:15),
                           y=(1:15)/2,
                           z=15:1)
        rownames(data) <- c(LETTERS[1:15])

        D3Barplot(data,
                  col=c('steelblue','grey','#de2d26'),
                  tooltip=c(paste0('letter_',LETTERS[1:15])),
                  xlab='Letters',
                  ylab='Frequencies',
                  title='New Barplot',
                  subtitle='with subtitle')
    })


    output$lowdimpanel <- renderD3Scatter({
        data <- data.frame(x=iris$Sepal.Length,
                           y=iris$Sepal.Width,
                           z=iris$Petal.Length,
                           Species=iris$Species)
        D3Scatter(data,
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
