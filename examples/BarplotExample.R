require(Biobase)
require(RColorBrewer)
require(d3Toolbox)


ui <- fillPage(fillRow(
  #multi-panel
  d3BarplotOutput("SE_panel", width = "100%", height = "100%"),
  fillCol(
    h3(verbatimTextOutput("currentOutput")),
    d3BarplotOutput("filterpanel", width = "100%", height = "100%"),
    d3BarplotOutput("tSNE_panel", width = "100%", height = "100%")
  ),flex = c(2,1))
  ,tags$head(tags$script(src="d3-toolbox.js"))
)

server <- function(input, output, session) {

    output$SE_panel <- renderd3Barplot({
        data <- data.frame(x=(1:15)/4*3,
                           y=(1:15)/2,
                           z=15:1)
        rownames(data) <- c(LETTERS[1:15])

        se <- data.frame(x=(1:15)/20,
                          y=(1:15)/15,
                          z=(15:1)/15)

        legend <- data.frame(col=c('steelblue','grey','#de2d26'),
                             name=c('blue','grey','red'))

        d3Barplot(data,
                  se=se,
                  beside=T,
                  col=c('steelblue','grey','#de2d26'),
                  tooltip=c(paste0('letter_',LETTERS[1:15])),
                  xlab='Letters',
                  ylab='Frequencies',
                  title='New Barplot',
                  legend=legend,
                  subtitle='with subtitle',
                  callback='BarSelection')
    })


  #multidim panel
  output$tSNE_panel <- renderd3Barplot({
      data <- data.frame(x=(1:15),
                         y=(1:15)/2,
                         z=15:1)
      d3Barplot(data,
                col=c('steelblue','grey','#de2d26'),
                tooltip=c(paste0('letter_',LETTERS[1:15])),
                xlab='Letters',
                ylab='Frequencies',
                title='New Barplot',
                subtitle='with subtitle',
                callback='BarSelection')
  })

  output$filterpanel <- renderd3Barplot({
      data <- 1:15
      names(data) <- c(LETTERS[1:11])

      se <- runif(15)
      d3Barplot(data,
                se,
                col=RColorBrewer::brewer.pal(11,"RdBu")[11:1],
                xlab='Letters',
                ylab='Frequencies',
                yrange=c(0,20),
                title='New Barplot',
                subtitle='with subtitle',
                callback='BarSelection')
  })


  output$lowdimpanel <- renderPlot(plot(AirPassengers))
  output$currentOutput <- renderPrint({ print(input$BarSelection) })

}

shinyApp(ui, server)
